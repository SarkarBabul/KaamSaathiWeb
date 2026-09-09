import { useQuery } from "@tanstack/react-query";
import { getSites } from "@/app-desktop/api/masterData.api";

export function useSites(userId: string | undefined) {
  return useQuery({
    queryKey: ["sites", userId],
    queryFn: async () => {
      const res = await getSites(userId!);
      return res.data ?? [];
    },
    enabled: Boolean(userId),
  });
}
