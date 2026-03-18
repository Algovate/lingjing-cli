#!/usr/bin/env node

import { Command, InvalidArgumentError } from "commander";
import { readFileSync } from "node:fs";
import {
  CAPABILITY_INPUT_TYPES,
  MODEL_PRESETS,
  getPresetByKey,
  supportsCapabilityInput,
  supportsCapabilityParam,
  type ModelPreset,
} from "./presets.js";
import { initEnv, type GlobalOptions } from "./env.js";
import {
  submitTask,
  queryTask,
  waitTask,
  extractUrls,
  getInnerResult,
  type WaitResult,
} from "./api.js";

type JsonPrimitive = string | number | boolean | null;
type JsonValue = JsonPrimitive | JsonValue[] | { [k: string]: JsonValue };
type JsonObject = Record<string, JsonValue>;
type MediaKind = "image" | "video";

type CreateInput = {
  preset?: string;
  apiId?: number;
  modelField?: "model" | "model_name";
  modelValue?: string;
  params?: string;
  paramsFile?: string;
  set: string[];
};

// ── Argument parsers ─────────────────────────────────────────────────────────

function parsePositiveInt(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed) || parsed <= 0) {
    throw new InvalidArgumentError(`${label} must be a positive integer`);
  }
  return parsed;
}

function parseIntValue(value: string, label: string): number {
  const parsed = Number(value);
  if (!Number.isInteger(parsed)) {
    throw new InvalidArgumentError(`${label} must be an integer`);
  }
  return parsed;
}

// ── Params building ──────────────────────────────────────────────────────────

function parseJsonObject(raw: string, label: string): JsonObject {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch (err) {
    throw new Error(`invalid ${label}: ${(err as Error).message}`);
  }
  if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
    throw new Error(`${label} must be a JSON object`);
  }
  return parsed as JsonObject;
}

function readParams(params?: string, paramsFile?: string): JsonObject {
  if (!params && !paramsFile) throw new Error("missing params: pass --params or --params-file");
  if (params && paramsFile) throw new Error("only one of --params or --params-file is allowed");
  if (params) return parseJsonObject(params, "--params");
  return parseJsonObject(readFileSync(paramsFile!, "utf8"), "--params-file");
}

function parseSetItem(item: string): [string, JsonValue] {
  const idx = item.indexOf("=");
  if (idx <= 0) throw new Error(`invalid --set "${item}", expected key=value`);
  const key = item.slice(0, idx).trim();
  const rawValue = item.slice(idx + 1).trim();
  if (!key) throw new Error(`invalid --set "${item}", key is empty`);
  try {
    return [key, JSON.parse(rawValue) as JsonValue];
  } catch {
    return [key, rawValue];
  }
}

function buildCreatePayload(
  input: CreateInput,
  kind: MediaKind
): { apiId: number; params: JsonObject; preset?: ModelPreset } {
  let params = readParams(input.params, input.paramsFile);
  if (input.set.length > 0) {
    const output: JsonObject = { ...params };
    for (const item of input.set) {
      const [key, value] = parseSetItem(item);
      output[key] = value;
    }
    params = output;
  }

  if (input.preset) {
    const preset = getPresetByKey(input.preset);
    if (!preset) throw new Error(`unknown preset: ${input.preset}`);
    if (kind === "image" && preset.capability !== "image")
      throw new Error(`preset ${preset.key} is ${preset.capability}, not image`);
    if (kind === "video" && preset.capability === "image")
      throw new Error(`preset ${preset.key} is image, not video`);
    if (params[preset.modelField] === undefined) params[preset.modelField] = preset.modelValue;
    return { apiId: preset.apiId, params, preset };
  }

  if (typeof input.apiId !== "number") throw new Error("missing target model: pass --preset or --api-id");
  if (input.modelField && input.modelValue && params[input.modelField] === undefined) {
    params[input.modelField] = input.modelValue;
  }
  return { apiId: input.apiId, params };
}

// ── Output helpers ───────────────────────────────────────────────────────────

function printOutput(payload: unknown): void {
  console.log(JSON.stringify(payload, null, 2));
}

function printWaitResult(
  global: GlobalOptions,
  waited: WaitResult,
  submitResponse?: Record<string, unknown>
): void {
  if (!global.json && waited.exitCode === 0) {
    for (const url of extractUrls(waited.result)) console.error(`url: ${url}`);
  }
  printOutput(submitResponse ? { submit: submitResponse, result: waited.result } : waited.result);
  if (waited.exitCode !== 0) process.exitCode = waited.exitCode;
}

// ── Commands ─────────────────────────────────────────────────────────────────

type PresetListOptions = {
  type?: string;
  provider?: string;
  capability?: string;
  supportsParam?: string;
  supportsInput?: string;
  compact?: boolean;
};

function filterPresets(opts: PresetListOptions): ModelPreset[] {
  const kind = opts.type as MediaKind | undefined;
  return MODEL_PRESETS.filter((p) => {
    if (kind === "image" && p.capability !== "image") return false;
    if (kind === "video" && p.capability === "image") return false;
    if (opts.provider && p.provider !== opts.provider) return false;
    if (opts.capability && p.capability !== opts.capability) return false;
    if (opts.supportsParam && !supportsCapabilityParam(p, opts.supportsParam)) return false;
    if (opts.supportsInput && !supportsCapabilityInput(p, opts.supportsInput)) return false;
    return true;
  });
}

function toCompactPreset(preset: ModelPreset): {
  key: string;
  apiId: number;
  provider: ModelPreset["provider"];
  capability: ModelPreset["capability"];
  inputs: ModelPreset["capSpec"]["inputs"];
  supportsParams: string[];
  summary: string;
} {
  return {
    key: preset.key,
    apiId: preset.apiId,
    provider: preset.provider,
    capability: preset.capability,
    inputs: preset.capSpec.inputs,
    supportsParams: Object.keys(preset.capSpec.params),
    summary: preset.capSpec.summary,
  };
}

function addPresetCommands(program: Command): void {
  const cmd = program.command("preset").description("browse model presets").helpCommand(false);

  cmd
    .command("list")
    .description("list available presets")
    .option("--type <type>", "filter by type: image | video")
    .option("--provider <provider>", "filter by provider")
    .option("--capability <capability>", "filter by capability")
    .option("--supports-param <name>", "filter presets that support a specific parameter")
    .option(
      "--supports-input <input>",
      `filter presets that support a specific input: ${CAPABILITY_INPUT_TYPES.join(" | ")}`
    )
    .option("--compact", "return compact view (summary + supported inputs/params)")
    .action((opts: PresetListOptions) => {
      if (opts.supportsInput && !CAPABILITY_INPUT_TYPES.includes(opts.supportsInput as (typeof CAPABILITY_INPUT_TYPES)[number])) {
        throw new Error(`invalid --supports-input: ${opts.supportsInput}`);
      }
      const results = filterPresets(opts);
      printOutput(opts.compact ? results.map(toCompactPreset) : results);
    });

  cmd
    .command("get")
    .description("get full preset detail with capSpec")
    .argument("<key>", "preset key")
    .action((key: string) => {
      const p = getPresetByKey(key);
      if (!p) throw new Error(`unknown preset: ${key}`);
      printOutput(p);
    });
}

function addMediaCommands(program: Command, kind: MediaKind): void {
  program
    .command(kind)
    .description(`submit ${kind} generation task and wait for result`)
    .option("--preset <presetKey>", "use preset (recommended)")
    .option("--api-id <id>", "manual apiId", (v) => parseIntValue(v, "--api-id"))
    .option("--model-field <field>", "model field: model|model_name")
    .option("--model-value <value>", "model value")
    .option("--params <json>", "params JSON string")
    .option("--params-file <path>", "params JSON file")
    .option("--set <key=value>", "override one params field", (v, acc: string[]) => [...acc, v], [])
    .option("--no-wait", "submit only, do not poll for result")
    .option("--interval <seconds>", "poll interval", (v) => parsePositiveInt(v, "--interval"), 5)
    .option("--timeout <seconds>", "max wait seconds", (v) => parsePositiveInt(v, "--timeout"), 600)
    .action(async (opts: CreateInput & { wait: boolean; interval: number; timeout: number }) => {
      const global = program.opts<GlobalOptions>();
      const payload = buildCreatePayload(opts, kind);
      const created = await submitTask(global, { apiId: payload.apiId, params: payload.params });
      if (!global.json) {
        console.error(`submitted ${kind} apiId=${payload.apiId}${payload.preset ? ` preset=${payload.preset.key}` : ""}`);
      }
      if (!opts.wait) {
        printOutput(created);
        return;
      }
      const taskId = getInnerResult(created).genTaskId ?? created.genTaskId;
      if (typeof taskId !== "string" || !taskId) throw new Error("submit response has no genTaskId");
      if (!global.json) console.error(`taskId=${taskId}`);
      printWaitResult(global, await waitTask(global, taskId, opts.interval, opts.timeout), created);
    });
}

function addTaskCommands(program: Command): void {
  const cmd = program.command("task").description("task query and polling").helpCommand(false);

  cmd
    .command("get")
    .description("query task status / result")
    .argument("<taskId>", "genTaskId")
    .action(async (taskId: string) => {
      printOutput(await queryTask(program.opts<GlobalOptions>(), taskId));
    });

  cmd
    .command("wait")
    .description("poll task until success/failure/timeout")
    .argument("<taskId>", "genTaskId")
    .option("--interval <seconds>", "poll interval", (v) => parsePositiveInt(v, "--interval"), 5)
    .option("--timeout <seconds>", "max wait seconds", (v) => parsePositiveInt(v, "--timeout"), 600)
    .action(async (taskId: string, opts: { interval: number; timeout: number }) => {
      const global = program.opts<GlobalOptions>();
      printWaitResult(global, await waitTask(global, taskId, opts.interval, opts.timeout));
    });
}

// ── Entry point ──────────────────────────────────────────────────────────────

function addMcpCommand(program: Command): void {
  program
    .command("mcp")
    .description("start MCP server over stdio (for Claude Desktop / claude mcp add)")
    .action(async () => {
      const { startMcpServer } = await import("./mcp.js");
      await startMcpServer(program.opts<GlobalOptions>());
    });
}

function makeProgram(): Command {
  const program = new Command();
  program
    .name("lingjing")
    .description("CLI for JDCloud Lingjing APIs (image / video / task)")
    .version("0.4.0")
    .showHelpAfterError("(run with --help for usage)")
    .option("-k, --api-key <key>", "JDCloud API key")
    .option("--base-url <url>", "API base URL")
    .option("--env-file <path>", "load env vars from specific file")
    .option("--skip-env", "skip auto-loading .env")
    .option("--request-id <id>", "x-jdcloud-request-id value")
    .option("--json", "JSON output mode");

  program.hook("preAction", () => initEnv(program.opts<GlobalOptions>()));

  addPresetCommands(program);
  addMediaCommands(program, "image");
  addMediaCommands(program, "video");
  addTaskCommands(program);
  addMcpCommand(program);

  return program;
}

async function main(): Promise<void> {
  await makeProgram().parseAsync(process.argv);
}

main().catch((err) => {
  console.error(`error: ${(err as Error).message}`);
  process.exit(1);
});
