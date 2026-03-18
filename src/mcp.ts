#!/usr/bin/env node

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { initEnv, type GlobalOptions } from "./env.js";
import { submitTask, waitTask, extractUrls, getInnerResult } from "./api.js";
import { MODEL_PRESETS, getPresetByKey, supportsCapabilityInput, supportsCapabilityParam } from "./presets.js";

type Obj = Record<string, unknown>;

const CAPABILITY_VALUES = ["image", "text-to-video", "image-to-video", "reference-to-video"] as const;
const PROVIDER_VALUES = ["doubao", "hailuo", "kling", "paiwo", "vidu"] as const;
const INPUT_VALUES = ["text_prompt", "image_url", "image_list", "ref_video"] as const;

function buildGlobal(overrideOpts?: Partial<GlobalOptions>): GlobalOptions {
  initEnv({ envFile: process.env.LINGJING_ENV_FILE });
  return { json: true, ...overrideOpts };
}

function toTextContent(value: unknown): { type: "text"; text: string } {
  return { type: "text", text: JSON.stringify(value, null, 2) };
}

function errorContent(message: string): { content: { type: "text"; text: string }[]; isError: true } {
  return { content: [{ type: "text", text: message }], isError: true };
}

function registerTools(server: McpServer, global: GlobalOptions): void {
  server.registerTool(
    "list_presets",
    {
      description: "List available model presets with full capability specs",
      inputSchema: {
        capability: z.enum(CAPABILITY_VALUES).optional().describe("filter by capability"),
        provider: z.enum(PROVIDER_VALUES).optional().describe("filter by provider"),
        supportsParam: z.string().optional().describe("filter by supported parameter"),
        supportsInput: z.enum(INPUT_VALUES).optional().describe("filter by supported input"),
        compact: z.boolean().optional().default(false).describe("compact output mode"),
      },
    },
    async ({ capability, provider, supportsParam, supportsInput, compact }) => {
      const results = MODEL_PRESETS.filter((p) => {
        if (capability && p.capability !== capability) return false;
        if (provider && p.provider !== provider) return false;
        if (supportsParam && !supportsCapabilityParam(p, supportsParam)) return false;
        if (supportsInput && !supportsCapabilityInput(p, supportsInput)) return false;
        return true;
      }).map((preset) => {
        if (!compact) return preset;
        return {
          key: preset.key,
          apiId: preset.apiId,
          provider: preset.provider,
          capability: preset.capability,
          inputs: preset.capSpec.inputs,
          supportsParams: Object.keys(preset.capSpec.params),
          summary: preset.capSpec.summary,
        };
      });
      return { content: [toTextContent(results)] };
    }
  );

  server.registerTool(
    "get_preset_capability",
    {
      description: "Get complete capability details for one preset",
      inputSchema: {
        preset: z.string().describe("preset key"),
      },
    },
    async ({ preset: presetKey }) => {
      const preset = getPresetByKey(presetKey);
      if (!preset) return errorContent(`unknown preset: ${presetKey}`);
      return {
        content: [
          toTextContent({
            key: preset.key,
            provider: preset.provider,
            capability: preset.capability,
            summary: preset.capSpec.summary,
            capSpec: preset.capSpec,
          }),
        ],
      };
    }
  );

  server.registerTool(
    "find_presets_by_capability",
    {
      description: "Find presets by capability input/parameter support",
      inputSchema: {
        capability: z.enum(CAPABILITY_VALUES).optional().describe("filter by capability"),
        provider: z.enum(PROVIDER_VALUES).optional().describe("filter by provider"),
        supportsParam: z.string().optional().describe("filter by supported parameter"),
        supportsInput: z.enum(INPUT_VALUES).optional().describe("filter by supported input"),
        compact: z.boolean().optional().default(false).describe("compact output mode"),
      },
    },
    async ({ capability, provider, supportsParam, supportsInput, compact }) => {
      const results = MODEL_PRESETS.filter((preset) => {
        if (capability && preset.capability !== capability) return false;
        if (provider && preset.provider !== provider) return false;
        if (supportsParam && !supportsCapabilityParam(preset, supportsParam)) return false;
        if (supportsInput && !supportsCapabilityInput(preset, supportsInput)) return false;
        return true;
      }).map((preset) => {
        if (!compact) return preset;
        return {
          key: preset.key,
          apiId: preset.apiId,
          provider: preset.provider,
          capability: preset.capability,
          inputs: preset.capSpec.inputs,
          supportsParams: Object.keys(preset.capSpec.params),
          summary: preset.capSpec.summary,
        };
      });

      return { content: [toTextContent(results)] };
    }
  );

  server.registerTool(
    "generate_image",
    {
      description: "Submit an image generation task using a preset and wait for the result",
      inputSchema: {
        preset: z.string().describe("preset key (e.g. 'doubao-seedream-4-0')"),
        params: z.record(z.unknown()).describe("task parameters object"),
        interval: z.number().int().positive().optional().default(5).describe("poll interval in seconds"),
        timeout: z.number().int().positive().optional().default(300).describe("max wait seconds"),
      },
    },
    async ({ preset: presetKey, params, interval, timeout }) => {
      const preset = getPresetByKey(presetKey);
      if (!preset) return errorContent(`unknown preset: ${presetKey}`);
      if (preset.capability !== "image") return errorContent(`preset ${presetKey} is ${preset.capability}, not image`);

      const mergedParams = { ...params } as Obj;
      if (mergedParams[preset.modelField] === undefined) mergedParams[preset.modelField] = preset.modelValue;

      let created: Obj;
      try {
        created = await submitTask(global, { apiId: preset.apiId, params: mergedParams });
      } catch (err) {
        return errorContent((err as Error).message);
      }

      const taskId = getInnerResult(created).genTaskId ?? created.genTaskId;
      if (typeof taskId !== "string" || !taskId) return errorContent("submit response has no genTaskId");

      const waited = await waitTask(global, taskId, interval, timeout);
      const urls = extractUrls(waited.result);
      const output = { submit: created, result: waited.result, urls };
      return { content: [toTextContent(output)], isError: waited.exitCode !== 0 };
    }
  );

  server.registerTool(
    "generate_video",
    {
      description: "Submit a video generation task using a preset and wait for the result",
      inputSchema: {
        preset: z.string().describe("preset key (e.g. 'kling-v2-6-ttv')"),
        params: z.record(z.unknown()).describe("task parameters object"),
        interval: z.number().int().positive().optional().default(5).describe("poll interval in seconds"),
        timeout: z.number().int().positive().optional().default(600).describe("max wait seconds (video is slower)"),
      },
    },
    async ({ preset: presetKey, params, interval, timeout }) => {
      const preset = getPresetByKey(presetKey);
      if (!preset) return errorContent(`unknown preset: ${presetKey}`);
      if (preset.capability === "image") return errorContent(`preset ${presetKey} is image, not video`);

      const mergedParams = { ...params } as Obj;
      if (mergedParams[preset.modelField] === undefined) mergedParams[preset.modelField] = preset.modelValue;

      let created: Obj;
      try {
        created = await submitTask(global, { apiId: preset.apiId, params: mergedParams });
      } catch (err) {
        return errorContent((err as Error).message);
      }

      const taskId = getInnerResult(created).genTaskId ?? created.genTaskId;
      if (typeof taskId !== "string" || !taskId) return errorContent("submit response has no genTaskId");

      const waited = await waitTask(global, taskId, interval, timeout);
      const urls = extractUrls(waited.result);
      const output = { submit: created, result: waited.result, urls };
      return { content: [toTextContent(output)], isError: waited.exitCode !== 0 };
    }
  );

}

export async function startMcpServer(overrideOpts?: Partial<GlobalOptions>): Promise<void> {
  const global = buildGlobal(overrideOpts);
  const server = new McpServer({
    name: "lingjing",
    version: "0.1.0",
  });
  registerTools(server, global);
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

async function main(): Promise<void> {
  await startMcpServer();
}

main().catch((err) => {
  process.stderr.write(`error: ${(err as Error).message}\n`);
  process.exit(1);
});
