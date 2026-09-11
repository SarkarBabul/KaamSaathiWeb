import { useMutation, useQuery } from "@tanstack/react-query";
import { createEmployerPaymentOrder, getEmployerPlans, verifyEmployerPayment } from "@/app-desktop/api/employerPricing.api";
import type { CreateOrderPayload, VerifyPaymentPayload } from "@/app-desktop/types/employerPricing";

export function useEmployerPlans(billingType: "MONTHLY" | "YEARLY") {
  return useQuery({
    queryKey: ["employerPlans", billingType],
    queryFn: async () => {
      const res = await getEmployerPlans(billingType);
      return res.status === "SUCCESS" ? (res.data ?? []) : [];
    },
  });
}

export function useCreateEmployerPaymentOrder() {
  return useMutation({
    mutationFn: (payload: CreateOrderPayload) => createEmployerPaymentOrder(payload),
  });
}

export function useVerifyEmployerPayment() {
  return useMutation({
    mutationFn: (payload: VerifyPaymentPayload) => verifyEmployerPayment(payload),
  });
}
