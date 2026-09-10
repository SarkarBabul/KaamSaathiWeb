// Field names verified directly against the real (legacy employer)
// Angular source — expense-tracker.types.ts, expense-tracker.component.ts,
// and expense-tracker.service.ts — NOT the enterprise-user page, which is
// fully mocked (no service, no HTTP calls; see PHASE_3D_EXPENSE_TRACKER
// verification doc). Corroborated by the independent Flutter client's
// expense_tracker_repository.dart for the read endpoints and the mutation
// endpoints/methods (Flutter's create/update payload SHAPE differs — see
// the doc — but the endpoints, methods, and read contracts agree).

export interface AmountResponse {
  totalReceived: number;
  totalSpent: number;
  availableBalance: number;
  totalDue: number;
  advanceGiven: number;
  advanceUsed: number;
  advanceRemaining: number;
}

export interface ExpenseCategory {
  id: number;
  name: string;
  type: string;
}

// A single line-item as the REAL backend actually returns it (confirmed
// live during the Phase 3D authorized create→verify→delete test — a
// transaction submitted with Angular's flat categoryId/amount fields came
// back with those fields nested here instead of at the transaction root).
// Angular's own Transaction interface has no concept of this at all; this
// is corroborated by Flutter's TransactionItem/items model
// (expense_tracker_model.dart), which expects the same nested shape.
export interface ExpenseTransactionItem {
  id: number;
  categoryId?: number | null;
  categoryName?: string | null;
  customCategory?: string | null;
  resolvedCategory?: string | null;
  unitId?: number | null;
  unitName?: string | null;
  quantity?: number | null;
  unitPrice?: number | null;
  totalAmount: number;
}

// The RAW wire shape — exactly what `GET /v2/transactions` can return.
// `categoryId`/`categoryName`/`quantity`/`unitPrice` are optional here
// because the live backend does not always populate them at the root (see
// `ExpenseTransactionItem` above); `items` carries the real values in that
// case. This type is only used at the API-layer parsing boundary —
// `expenseTracker.api.ts` normalizes every record into the fully-resolved
// `ExpenseTransaction` shape below before it ever reaches a hook or
// component, so the rest of the app never has to think about `items[]`.
export interface RawExpenseTransaction {
  id: number;
  type: "INCOME" | "EXPENSE";
  quantity?: number | null;
  unitPrice?: number | null;
  grossAmount?: number;
  advanceDeducted?: number;
  amount: number;
  categoryId?: number | null;
  categoryName?: string | null;
  siteId: number;
  paymentType?: "FULL_PAID" | "PARTIAL" | "UNPAID";
  paymentMode?: "CASH" | "UPI" | "BANK";
  paidAmount?: number;
  dueAmount?: number;
  partyName?: string | null;
  recipientName?: string | null;
  advanceId?: number | null;
  advanceRemaining?: number | null;
  advanceStatus?: string | null;
  description?: string | null;
  transactionDate: string;
  receiptUrl?: string | null;
  items?: ExpenseTransactionItem[];
}

// The NORMALIZED, UI-facing shape — what every hook/component actually
// consumes. `categoryId`/`categoryName` are guaranteed present (resolved
// from the root fields when available, else from `items`, see
// `normalizeTransaction` in expenseTracker.api.ts). `grossAmount` (not
// `amount`) is what the real Angular template renders for the list row
// (`t.grossAmount`, expense-tracker.component.html:209) and what
// editTransaction() reads back into the form's `amount` field — preserved
// exactly rather than "corrected" to use `amount` uniformly.
export interface ExpenseTransaction {
  id: number;
  type: "INCOME" | "EXPENSE";
  quantity?: number | null;
  unitPrice?: number | null;
  grossAmount?: number;
  advanceDeducted?: number;
  amount: number;
  categoryId: number;
  categoryName: string;
  siteId: number;
  paymentType?: "FULL_PAID" | "PARTIAL" | "UNPAID";
  paymentMode?: "CASH" | "UPI" | "BANK";
  paidAmount?: number;
  dueAmount?: number;
  partyName?: string | null;
  recipientName?: string | null;
  advanceId?: number | null;
  advanceRemaining?: number | null;
  advanceStatus?: string | null;
  description?: string | null;
  transactionDate: string;
  receiptUrl?: string | null;
}
