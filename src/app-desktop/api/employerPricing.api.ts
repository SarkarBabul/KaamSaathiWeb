import { api } from "@/app-desktop/api/httpClient";
import type { ApiEnvelope } from "@/app-desktop/types/auth";
import type {
  CreateOrderPayload,
  CreateOrderResponse,
  EmployerPlan,
  VerifyPaymentPayload,
} from "@/app-desktop/types/employerPricing";

// pricing-service.ts calls api.get/api.post with no isEnterprise argument on
// every method — all three resolve to `default`. (updatePlan() exists on
// the service but is never called from pricing.component.ts — dead code,
// not reproduced here.)
const TARGET = "default" as const;

export function getEmployerPlans(billingType: "MONTHLY" | "YEARLY") {
  return api.get<ApiEnvelope<EmployerPlan[]>>(TARGET, "/v2/plans", { type: billingType });
}

export function createEmployerPaymentOrder(payload: CreateOrderPayload) {
  return api.post<CreateOrderResponse>(TARGET, "/v2/payment/createOrder", payload);
}

export function verifyEmployerPayment(payload: VerifyPaymentPayload) {
  return api.post<unknown>(TARGET, "/v2/payment/verifyPayment", payload);
}
