import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { addSubordinate, editSubordinate, getSubordinates } from "@/app-desktop/api/userManagement.api";
import type { EditSubordinatePayload } from "@/app-desktop/types/userManagement";

export function useSubordinates(parentId: string | undefined) {
  return useQuery({
    queryKey: ["subordinates", parentId],
    queryFn: async () => {
      const res = await getSubordinates(parentId!);
      if (res.status === "SUCCESS" && res.subordinates) {
        return res.subordinates;
      }
      return [];
    },
    enabled: Boolean(parentId),
  });
}

interface CreateSubordinateInput {
  name: string;
  site_id: number;
}

// LIVE-VERIFIED contract (USER_MANAGEMENT_API_VERIFICATION.md §27): role
// is always the literal "supervisor" and isGeneratedMobile is always
// true — neither is a form field, matching the verified working request.
// parentUserId is resolved here from the authenticated session, never
// taken from caller input, so it can never become a user-editable field.
export function useCreateSubordinate(parentUserId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (input: CreateSubordinateInput) => {
      if (!parentUserId) {
        throw new Error("Your session is missing required account information. Please sign in again.");
      }
      const res = await addSubordinate({
        name: input.name,
        role: "supervisor",
        site_id: input.site_id,
        isGeneratedMobile: true,
        parentUserId,
      });
      if (res.status !== "SUCCESS") {
        throw new Error(res.statusMsg ?? res.message ?? "Could not add user");
      }
      return res;
    },
    onSuccess: () => {
      // Refetch the authoritative list from getSubordinate rather than
      // fabricating the new row locally — the backend is the source of
      // truth (per Phase 3B Task 8).
      queryClient.invalidateQueries({ queryKey: ["subordinates"] });
    },
  });
}

// LIVE-VERIFIED contract (§28): the exact legacy edit-elist.component.ts
// payload shape. Callers must supply every field the record already has
// (unchanged) plus whatever the user intentionally edited — this hook
// does not fill in or drop any field on its own, to avoid ever silently
// turning an edit into a partial/hybrid payload.
export function useEditSubordinate() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: EditSubordinatePayload) => {
      const res = await editSubordinate(payload);
      if (res.status !== "SUCCESS") {
        throw new Error(res.message ?? "Could not update user");
      }
      return res;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["subordinates"] });
    },
  });
}
