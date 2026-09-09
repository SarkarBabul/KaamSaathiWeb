import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchAttendance } from "@/app-desktop/api/attendance.api";
import { flattenAttendanceGroups } from "@/app-desktop/types/attendance";
import { isValidDateRange } from "@/app-desktop/utils/dateRange";

interface UseAttendanceArgs {
  userId: string | undefined;
  startDate: string;
  endDate: string;
}

// Mirrors the Angular page's gating: a date is optional on first load (the
// API accepts startDate/endDate as optional and returns its own default
// range), but once the user starts picking dates, a refetch against the
// backend only happens once both are set and start <= end. An incomplete
// or invalid range simply keeps showing the last good result instead of
// clearing the table, via placeholderData.
export function useAttendance({ userId, startDate, endDate }: UseAttendanceArgs) {
  const hasDateFilter = Boolean(startDate || endDate);
  const dateFilterValid = !hasDateFilter || isValidDateRange(startDate, endDate);

  return useQuery({
    queryKey: ["attendance", userId, startDate, endDate],
    queryFn: async () => {
      const res = await fetchAttendance({
        userId: userId!,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      return flattenAttendanceGroups(res.data ?? []);
    },
    enabled: Boolean(userId) && dateFilterValid,
    placeholderData: keepPreviousData,
  });
}
