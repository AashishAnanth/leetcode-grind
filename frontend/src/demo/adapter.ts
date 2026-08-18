/**
 * Demo mode: serve the UI from bundled fixtures instead of a backend.
 *
 * The deployed build has no API to talk to — this app's backend is a local
 * FastAPI process with a SQLite database, a scheduler, and Claude API calls,
 * none of which run on static hosting. `VITE_DEMO=1` swaps axios' transport for
 * a lookup against `fixtures.json` so the deployed site shows the real UI
 * rather than a wall of error states.
 *
 * The problem list is the public NeetCode 250. Everything personal — solve
 * history, written code, notes, coaching transcripts — is invented. None of the
 * author's own practice data is here.
 *
 * Writes are refused rather than faked, so nothing silently pretends to save.
 */
import type { AxiosAdapter, AxiosRequestConfig } from "axios";

import fixtures from "./fixtures.json";

const TABLE = fixtures as Record<string, any>;

export const DEMO = import.meta.env.VITE_DEMO === "1";

const READ_ONLY =
  "This is a read-only demo — the button works, but there is no backend to write to. " +
  "Clone the repo and run it locally to use it for real.";

function lookup(url: string): unknown | undefined {
  const [rawPath, query] = url.split("?");
  const path = rawPath.replace(/\/$/, "");

  // /problems?pattern=&difficulty=&status=&search=
  if (path === "/problems") {
    const q = new URLSearchParams(query ?? "");
    let rows = TABLE["GET /problems"] as any[];
    const pattern = q.get("pattern");
    const difficulty = q.get("difficulty");
    const status = q.get("status");
    const search = (q.get("search") ?? "").toLowerCase();
    if (pattern) rows = rows.filter((r) => r.pattern === pattern);
    if (difficulty) rows = rows.filter((r) => r.difficulty === difficulty);
    if (status) rows = rows.filter((r) => r.status === status);
    if (search) rows = rows.filter((r) => r.title.toLowerCase().includes(search));
    return rows;
  }

  const exact = TABLE[`GET ${path}`];
  if (exact !== undefined) return exact;

  let m: RegExpMatchArray | null;

  if ((m = path.match(/^\/problems\/(\d+)$/))) {
    const p = (TABLE["GET /problems"] as any[]).find((r) => String(r.id) === m![1]);
    return p ? { ...p, solve_history: TABLE._logs[m[1]] ?? [] } : undefined;
  }
  if ((m = path.match(/^\/problems\/(\d+)\/history$/))) {
    return TABLE._logs[m[1]] ?? [];
  }
  if ((m = path.match(/^\/whiteboard\/(\d+)\/messages$/))) {
    // Conversations are stored per problem. The first version kept one two-sum
    // chat and stamped it onto whatever problem you opened, so every problem
    // showed the same discussion — the clearest possible tell that the data
    // was fabricated. Problems without a saved conversation return empty,
    // which is also what a real log looks like.
    return TABLE._whiteboard[m[1]] ?? [];
  }
  if ((m = path.match(/^\/vault\/(.+)$/))) {
    const pattern = decodeURIComponent(m[1]);
    const content = TABLE._vault[pattern];
    return content === undefined
      ? { pattern, content: "", updated_at: null }
      : { pattern, content, updated_at: new Date().toISOString() };
  }
  return undefined;
}

export const demoAdapter: AxiosAdapter = async (config: AxiosRequestConfig) => {
  const method = (config.method ?? "get").toUpperCase();
  const url = config.url ?? "";
  await new Promise((r) => setTimeout(r, 120));

  const respond = (status: number, data: unknown) => ({
    data,
    status,
    statusText: status === 200 ? "OK" : "Demo",
    headers: {},
    config: config as never,
  });
  const fail = (status: number, message: string) =>
    Promise.reject(
      Object.assign(new Error(message), {
        response: respond(status, { detail: message }),
        config,
        isAxiosError: true,
      })
    );

  if (method !== "GET") return fail(403, READ_ONLY);

  const data = lookup(url);
  if (data === undefined) return fail(404, `Not available in the demo: ${url}`);
  return respond(200, data);
};
