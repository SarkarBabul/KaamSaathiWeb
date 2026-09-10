import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addSite, updateSite } from "@/app-desktop/api/siteManagement.api";
import type { AddSitePayload, UpdateSitePayload } from "@/app-desktop/types/site";

// Mirrors useUserManagement.ts's mutation pattern: never fabricate the
// created/edited record from the response body (the create/edit response
// shape is not live-verified — see siteManagement.api.ts). A successful
// call (no thrown ApiError) invalidates the sites query so the UI always
// reflects what the backend actually has, never a locally-guessed row.
// `userId` is resolved from the authenticated session by the caller and
// passed in here, never taken from user-editable form input.

interface AddSiteInput {
  siteName: string;
  address: string;
  pinCode: string;
}

export function useAddSite(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: AddSiteInput) => {
      if (!userId) {
        throw new Error("Your session is missing required account information. Please sign in again.");
      }
      const payload: AddSitePayload = { ...input, userId };
      return addSite(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}

interface UpdateSiteInput {
  siteId: number;
  siteName: string;
  address: string;
  pinCode: string;
}

export function useUpdateSite(userId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: UpdateSiteInput) => {
      if (!userId) {
        throw new Error("Your session is missing required account information. Please sign in again.");
      }
      const payload: UpdateSitePayload = { ...input, userId: Number(userId) };
      return updateSite(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sites"] });
    },
  });
}
