import { existsSync, readFileSync } from "node:fs";

export type GlobalOptions = {
  apiKey?: string;
  baseUrl?: string;
  requestId?: string;
  envFile?: string;
  skipEnv?: boolean;
  json?: boolean;
};

export const DEFAULT_BASE_URL = "https://model.jdcloud.com";

function parseEnvFile(content: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const rawLine of content.split(/\r?\n/)) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#")) continue;
    const eq = line.indexOf("=");
    if (eq <= 0) continue;
    const key = line.slice(0, eq).trim();
    let value = line.slice(eq + 1).trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    if (key) result[key] = value;
  }
  return result;
}

function applyEnvFile(path: string, required: boolean): void {
  if (!existsSync(path)) {
    if (required) throw new Error(`env file not found: ${path}`);
    return;
  }
  for (const [key, value] of Object.entries(parseEnvFile(readFileSync(path, "utf8")))) {
    if (process.env[key] === undefined) process.env[key] = value;
  }
}

export function initEnv(options: GlobalOptions): void {
  if (options.skipEnv) return;
  applyEnvFile(options.envFile ?? ".env", !!options.envFile);
}

export function resolveApiKey(options: GlobalOptions): string {
  return options.apiKey ?? process.env.LINGJING_API_KEY ?? process.env.JDCLOUD_API_KEY ?? "";
}

export function resolveBaseUrl(options: GlobalOptions): string {
  return options.baseUrl ?? process.env.LINGJING_BASE_URL ?? DEFAULT_BASE_URL;
}
