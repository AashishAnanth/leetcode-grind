import axios from "axios";

import { DEMO, demoAdapter } from "@/demo/adapter";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

// In demo builds there is no server to reach, so the transport is replaced
// wholesale rather than the base URL repointed. See demo/adapter.ts.
if (DEMO) api.defaults.adapter = demoAdapter;

export default api;
