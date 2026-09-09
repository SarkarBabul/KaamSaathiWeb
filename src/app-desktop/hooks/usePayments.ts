import { keepPreviousData, useQuery } from "@tanstack/react-query";
import { fetchPaymentsLedger } from "@/app-desktop/api/payments.api";
import { flattenPaymentGroups } from "@/app-desktop/types/payments";
import { isValidDateRange } from "@/app-desktop/utils/dateRange";

interface UsePaymentsArgs {
  enterpriseId: string | undefined;
  startDate: string;
  endDate: string;
}

export function usePayments({ enterpriseId, startDate, endDate }: UsePaymentsArgs) {
  const hasDateFilter = Boolean(startDate || endDate);
  const dateFilterValid = !hasDateFilter || isValidDateRange(startDate, endDate);

  return useQuery({
    queryKey: ["payments", "ledger", enterpriseId, startDate, endDate],
    queryFn: async () => {
      const res = await fetchPaymentsLedger({
        enterpriseId: enterpriseId!,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
      });
      return flattenPaymentGroups(res.data ?? []);
    },
    enabled: Boolean(enterpriseId) && dateFilterValid,
    placeholderData: keepPreviousData,
  });
}
