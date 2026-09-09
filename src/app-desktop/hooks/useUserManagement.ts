import { useQuery } from "@tanstack/react-query";
import { getSubordinates } from "@/app-desktop/api/userManagement.api";

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
