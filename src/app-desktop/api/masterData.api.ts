import { api } from "@/app-desktop/api/httpClient";
import type { ApiEnvelope } from "@/app-desktop/types/auth";
import type { Site } from "@/app-desktop/types/site";

// Angular's ApiService.get() silently ignores its enterprise-flag parameter
// (a documented bug — every GET always hit the default base regardless of
// the flag passed in), so in practice getAllSites has only ever hit the
// default API in production. Now that the flag is actually honored end to
// end (§6 of the migration blueprint), "default" here is a deliberate
// choice to match today's real, working behavior rather than the
// intended-but-never-executed "enterprise" flag some callers passed.
export function getSites(userId: string) {
  return api.get<ApiEnvelope<Site[]>>("default", "/v2/getAllSites", { userId });
}
