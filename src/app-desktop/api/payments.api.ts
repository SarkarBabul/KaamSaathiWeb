import { api, postBlob } from "@/app-desktop/api/httpClient";
import type { ApiEnvelope } from "@/app-desktop/types/auth";
import type { PaymentGroup } from "@/app-desktop/types/payments";

// Verified directly against the Angular source (enterprise-payments.ts +
// api.service.ts): getPaymentDetails() calls api.post(url, payload) with no
// flag argument -> defaults false -> apiBaseUrl. downloadPaymentPdf/Excel
// call api.postBlob(), which has no flag parameter at all and always hits
// apiBaseUrl. The "/v2/enterprise/..." path segment is just a route name on
// the default API, not a signal that it targets enterpriseapiBaseUrl.
const TARGET = "default" as const;

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
