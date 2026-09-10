import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  addExpenseTransaction,
  deleteExpenseTransaction,
  getExpenseAmount,
  getExpenseCategories,
  getExpenseTransactions,
  updateExpenseTransaction,
} from "@/app-desktop/api/expenseTracker.api";
import type { ExpenseTransaction } from "@/app-desktop/types/expenseTracker";

export function useExpenseAmount(leaderId: string | undefined) {
  return useQuery({
    queryKey: ["expense-tracker", "amount", leaderId],
    queryFn: () => getExpenseAmount(leaderId!),
    enabled: Boolean(leaderId),
  });
}

export function useExpenseTransactions(leaderId: string | undefined) {
  return useQuery({
    queryKey: ["expense-tracker", "transactions", leaderId],
    queryFn: () => getExpenseTransactions(leaderId!),
    enabled: Boolean(leaderId),
  });
}

// Angular fetches categories on demand (dialog open / type toggle), not
// on page mount — mirrored here via `enabled`, so opening the Add/Edit
// dialog is what triggers this call, matching the real app's behavior.
export function useExpenseCategories(type: "income" | "expense" | null) {
  return useQuery({
    queryKey: ["expense-tracker", "categories", type],
    queryFn: () => getExpenseCategories(type === "income" ? "INCOME" : "EXPENSE"),
    enabled: type !== null,
  });
}

// Angular's ExpenseTrackerService.addTransaction()/.updateTransaction()
// both do `body.append('leaderId', this.parentId)` (parentId =
// String(TokenService.getParentId())) before every create/update call —
// re-verified directly against expense-tracker.service.ts during this
// fix. `leaderId` is appended here, from the authenticated session's
// `userId` (the same value used as `parentId` throughout this app, e.g.
// Site Management/User Management's create flows), mirroring exactly
// where User Management's `useCreateSubordinate(parentUserId)` attaches
// its own session-sourced, non-user-editable field: inside the mutation
// hook, never left to the caller to remember. `leaderId` is intentionally
// NOT user-editable and never appears in the React form.
export function useAddExpenseTransaction(leaderId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, body }: { type: "income" | "expense"; body: FormData }) => {
      if (!leaderId) {
        throw new Error("Your session is missing required account information. Please sign in again.");
      }
      body.append("leaderId", leaderId);
      return addExpenseTransaction(type, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-tracker", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["expense-tracker", "amount"] });
    },
  });
}

// Same leaderId handling as useAddExpenseTransaction above.
export function useUpdateExpenseTransaction(leaderId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ type, id, body }: { type: "income" | "expense"; id: number; body: FormData }) => {
      if (!leaderId) {
        throw new Error("Your session is missing required account information. Please sign in again.");
      }
      body.append("leaderId", leaderId);
      return updateExpenseTransaction(type, id, body);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["expense-tracker", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["expense-tracker", "amount"] });
    },
  });
}

// The transaction-list query key ends in a dynamic `leaderId` segment
// (["expense-tracker", "transactions", leaderId]), so this mutation —
// which only receives the deleted transaction's own `id`, never the
// leaderId — can't address that exact key. Live-verified during the
// Phase 3D mutation test that a plain `invalidateQueries` on the partial
// key alone left the deleted row visible until a manual reload: the
// invalidation does mark the query stale and schedules a background
// refetch, but that refetch is a real network round-trip, so there's a
// window where the UI is still showing the pre-delete cached list. Fixed
// with `setQueriesData` (matches every query under the partial key,
// exactly like `invalidateQueries` does) to synchronously strip the
// deleted row out of whatever list is already cached the instant the
// delete succeeds — no waiting on a refetch — with `invalidateQueries`
// kept alongside it so the cache still reconciles with the server's own
// state afterward (e.g. if summary totals derived server-side changed).
export function useDeleteExpenseTransaction() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => deleteExpenseTransaction(id),
    onSuccess: (_data, deletedId) => {
      queryClient.setQueriesData<ExpenseTransaction[]>(
        { queryKey: ["expense-tracker", "transactions"] },
        (current) => current?.filter((t) => t.id !== deletedId),
      );
      queryClient.invalidateQueries({ queryKey: ["expense-tracker", "transactions"] });
      queryClient.invalidateQueries({ queryKey: ["expense-tracker", "amount"] });
    },
  });
}
