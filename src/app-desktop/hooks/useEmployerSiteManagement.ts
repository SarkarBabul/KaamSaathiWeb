import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateEmployerSite } from "@/app-desktop/api/employerSiteManagement.api";
import type { UpdateSitePayload } from "@/app-desktop/types/site";

// useAddSite (from useSiteManagement.ts) is reused as-is for the Employer
// Add Site flow — its target/payload are genuinely identical for both
// surfaces (see employerSiteManagement.api.ts). Only edit needs its own
// hook, since the Employer edit call targets `default`, not `enterprise`.
interface UpdateSiteInput {
  siteId: number;
  siteName: string;
  address: string;
  pinCode: string;
}

export function useUpdateEmployerSite(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSiteInput) => {
      if (!userId) {
        throw new Error("Your session is missing required account information. Please sign in again.");
      }
      const payload: UpdateSitePayload = { ...input, userId: Number(userId) };
      return updateEmployerSite(payload);
    },
    onSuccess: () => {
      // Same list ("sites") that useSites() populates — shared with
      // Enterprise Site Management, since both read the same account-scoped
      // GET /v2/getAllSites data.
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}
