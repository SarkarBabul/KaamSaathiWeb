import { api } from "@/app-desktop/api/httpClient";
import type {
  AmountResponse,
  ExpenseCategory,
  ExpenseTransaction,
  RawExpenseTransaction,
} from "@/app-desktop/types/expenseTracker";

// Normalization boundary: the real backend does not always populate
// categoryId/categoryName/quantity/unitPrice at the transaction root —
// live-verified during the Phase 3D authorized mutation test, a
// transaction created with Angular's flat single-category contract came
// back with those fields nested under `items[]` instead. Angular's own UI
// has no concept of `items` at all — it renders one row per transaction
// with one category — so that remains the UI's mental model here too;
// this function's job is only to make sure that single category is
// resolved from wherever the backend actually put it, without silently
// discarding data when more than one item is present.
function normalizeTransaction(raw: RawExpenseTransaction): ExpenseTransaction {
  const items = raw.items ?? [];
  const hasRootCategory = raw.categoryId != null && Boolean(raw.categoryName);

  let categoryId = raw.categoryId ?? 0;
  let categoryName = raw.categoryName ?? "";
  let quantity = raw.quantity;
  let unitPrice = raw.unitPrice;

  if (!hasRootCategory && items.length > 0) {
    if (items.length === 1) {
      const item = items[0];
      categoryId = item.categoryId ?? categoryId;
      categoryName = item.resolvedCategory || item.categoryName || item.customCategory || "Uncategorized";
      quantity = item.quantity ?? quantity;
      unitPrice = item.unitPrice ?? unitPrice;
    } else {
      // Multiple line items with different categories: no single
      // qty/unitPrice can represent them without fabricating a number, so
      // those are left undefined; the category name instead lists every
      // item's category rather than silently showing only the first.
      categoryId = items[0].categoryId ?? categoryId;
      categoryName = items
        .map((item) => item.resolvedCategory || item.categoryName || item.customCategory || "Uncategorized")
        .join(", ");
      quantity = undefined;
      unitPrice = undefined;
    }
  } else if (!hasRootCategory) {
    categoryName = "Uncategorized";
  }

  // Destructure `items` out explicitly rather than spreading `raw`
  // as-is — the normalized, UI-facing `ExpenseTransaction` type has no
  // `items` field, and this keeps that guarantee structural, not just
  // assumed.
  const { items: _items, ...rest } = raw;
  return { ...rest, categoryId, categoryName, quantity, unitPrice };
}

// All 6 endpoints below are called by Angular's real (legacy employer)
// ExpenseTrackerService with NO enterprise-flag argument on any call —
// and ApiService.get()'s flag is always a no-op, ApiService.post()'s flag
// defaults to false when omitted (real switch, but never passed here so
// it takes the false/default branch), and ApiService.delete() has no flag
// parameter at all. Every one of these six calls resolves to `apiBaseUrl`
// today — unlike Site Management, there is no create/edit host split to
// resolve for this feature.
const TARGET = "default" as const;

export function getExpenseAmount(leaderId: string) {
  return api.get<AmountResponse>(TARGET, "/v2/dashboard", { leaderId });
}

export async function getExpenseTransactions(leaderId: string): Promise<ExpenseTransaction[]> {
  const raw = await api.get<RawExpenseTransaction[]>(TARGET, "/v2/transactions", { leaderId });
  return raw.map(normalizeTransaction);
}

export function getExpenseCategories(type: "INCOME" | "EXPENSE") {
  return api.get<ExpenseCategory[]>(TARGET, "/v2/categories", { type });
}

// MUTATION — NOT LIVE VERIFIED, NOT EXECUTED during Phase 3D. Angular
// sends this as multipart/form-data (a real FormData body, built from the
// reactive form + leaderId appended by the service). httpClient.ts's
// request() now has a FormData-aware branch (added to unblock this
// endpoint — see httpClient.ts) that passes the body straight to fetch()
// without JSON.stringify or a manual Content-Type, so the browser can
// generate the multipart boundary itself. That fixes the serialization
// blocker, but the request/response contract against the real backend is
// still unverified — no live call has been made, per this phase's
// no-mutation instruction.
export function addExpenseTransaction(type: "income" | "expense", body: FormData) {
  return api.post<unknown>(TARGET, `/v2/transactions/${type}`, body);
}

// MUTATION — same FormData handling as addExpenseTransaction above; same
// NOT LIVE VERIFIED status.
export function updateExpenseTransaction(type: "income" | "expense", id: number, body: FormData) {
  return api.post<unknown>(TARGET, `/v2/transactions/update/${type}/${id}`, body);
}

// MUTATION — plain DELETE, no body, so it was never affected by the
// FormData/JSON.stringify issue above — but is still NOT LIVE VERIFIED
// and NOT executed during Phase 3D per the explicit no-mutation
// instruction for this phase.
export function deleteExpenseTransaction(id: number) {
  return api.delete<unknown>(TARGET, `/v2/transactions/${id}`);
}
