import { randomUUID } from "node:crypto";
import { resolveApiKey, resolveBaseUrl, type GlobalOptions } from "./env.js";

type Obj = Record<string, unknown>;

const SUBMIT_PATH = "/joycreator/openApi/submitTask";
const QUERY_PATH = "/joycreator/openApi/queryTasKResult";

async function post<T>(url: string, apiKey: string, requestId: string, body: Obj): Promise<T> {
  if (!apiKey) throw new Error("missing api key: pass --api-key or set LINGJING_API_KEY/JDCLOUD_API_KEY");
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "x-jdcloud-request-id": requestId,
    },
    body: JSON.stringify(body),
  });
  const text = await res.text();
  if (!res.ok) throw new Error(`http ${res.status}: ${text}`);
  return (text ? JSON.parse(text) : {}) as T;
}

export function getInnerResult(response: Obj): Obj {
  const outer = response.result;
  if (outer && typeof outer === "object") {
    const mid = (outer as Obj).result;
    if (mid && typeof mid === "object") return mid as Obj;
    return outer as Obj;
  }
  return response;
}

export function checkApiSuccess(response: Obj, label: string): void {
  const inner = getInnerResult(response);
  if (inner.success === false) {
    const msg = typeof inner.error === "string" && inner.error ? inner.error : "unknown error";
    throw new Error(`${label}: ${msg}`);
  }
}

export function extractUrls(result: Obj): string[] {
  const items = getInnerResult(result).taskResults;
  if (!Array.isArray(items)) return [];
  return items.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const { url, watermarkUrl } = item as Obj;
    const resolved =
      (typeof url === "string" && url) || (typeof watermarkUrl === "string" && watermarkUrl);
    return resolved ? [resolved] : [];
  });
}

export function getTaskStatus(result: Obj): number | undefined {
  const code = getInnerResult(result).taskStatus;
  return typeof code === "number" ? code : undefined;
}

export async function submitTask(global: GlobalOptions, payload: Obj): Promise<Obj> {
  const result = await post<Obj>(
    `${resolveBaseUrl(global)}${SUBMIT_PATH}`,
    resolveApiKey(global),
    global.requestId ?? randomUUID(),
    payload
  );
  checkApiSuccess(result, "submit failed");
  return result;
}

export async function queryTask(
  global: GlobalOptions,
  taskId: string,
  requestId = global.requestId ?? randomUUID()
): Promise<Obj> {
  return post<Obj>(
    `${resolveBaseUrl(global)}${QUERY_PATH}`,
    resolveApiKey(global),
    requestId,
    { genTaskId: taskId }
  );
}

export type WaitResult = { result: Obj; exitCode: number };

export async function waitTask(
  global: GlobalOptions,
  taskId: string,
  interval: number,
  timeout: number
): Promise<WaitResult> {
  const startedAt = Date.now();
  let latest: Obj = {};

  while (true) {
    latest = await queryTask(global, taskId, randomUUID());
    checkApiSuccess(latest, "query failed");
    const elapsed = Math.floor((Date.now() - startedAt) / 1000);
    const status = getTaskStatus(latest);

    if (status === 4) {
      if (!global.json) console.error(`completed in ${elapsed}s`);
      return { result: latest, exitCode: 0 };
    }
    if (status === 2) {
      if (!global.json) console.error(`failed in ${elapsed}s`);
      return { result: latest, exitCode: 2 };
    }
    if (elapsed >= timeout) {
      if (!global.json) console.error(`timeout in ${elapsed}s`);
      return { result: latest, exitCode: 3 };
    }
    if (!global.json) {
      console.error(`pending status=${String(status)} elapsed=${elapsed}s next=${interval}s`);
    }
    await new Promise((r) => setTimeout(r, interval * 1000));
  }
}
