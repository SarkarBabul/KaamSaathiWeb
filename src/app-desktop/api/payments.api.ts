import { api, postBlob } from "@/app-desktop/api/httpClient";
import type { ApiEnvelope } from "@/app-desktop/types/auth";
import type { PaymentGroup } from "@/app-desktop/types/payments";

// UNKNOWN — see the identical note in attendance.api.ts: the blueprint
// doesn't state this service's base URL explicitly. "enterprise" is chosen
// on the same basis (the /v2/enterprise/* path, co-located with the other
// enterprise-dashboard services) and needs backend confirmation.
const TARGET = "enterprise" as const;

export interface PaymentsQuery {
  enterpriseId: string;
  startDate?: string;
  endDate?: string;
}

export function fetchPaymentsLedger(query: PaymentsQuery) {
  return api.post<ApiEnvelope<PaymentGroup[]>>(TARGET, "/v2/enterprise/payments/ledger", query);
}

export function exportPaymentsPdf(query: PaymentsQuery) {
  return postBlob(TARGET, "/v2/enterprise/payments/ledger/export/pdf", query);
}

export function exportPaymentsExcel(query: PaymentsQuery) {
  return postBlob(TARGET, "/v2/enterprise/payments/ledger/export/excel", query);
}
