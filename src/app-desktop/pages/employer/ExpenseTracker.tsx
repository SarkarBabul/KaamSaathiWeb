import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownRight,
  ArrowUpRight,
  CircleAlert,
  Inbox,
  Landmark,
  Pencil,
  Plus,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";
import { AnimatedItem } from "@/app-desktop/components/fx/AnimatedList";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useSites } from "@/app-desktop/hooks/useSites";
import {
  useAddExpenseTransaction,
  useDeleteExpenseTransaction,
  useExpenseAmount,
  useExpenseCategories,
  useExpenseTransactions,
  useUpdateExpenseTransaction,
} from "@/app-desktop/hooks/useExpenseTracker";
import { ApiError } from "@/app-desktop/api/httpClient";
import { cn } from "@/lib/utils";
import type { ExpenseTransaction } from "@/app-desktop/types/expenseTracker";

// Same real ExpenseTrackerService the already-accepted Enterprise Expense
// Tracker uses (Phase 3D audit) — this IS the "legacy employer" source, so
// the API/hooks/types layer is reused as-is, not duplicated. The only
// genuine difference confirmed against expense-tracker.component.html is
// that Employer's real template has no chart panels — just the 5 summary
// cards, filter, ledger, and add/edit/delete dialogs — so those are the
// only sections reproduced here.
const ADVANCE_CATEGORY_NAME = "Advance Received";
const DASH = "—";

type TxnType = "expense" | "income";
type PaymentType = "full_paid" | "partial" | "unpaid";
type PaymentMode = "cash" | "upi" | "bank";
type FilterType = "ALL" | "INCOME" | "EXPENSE";

interface TransactionFormValues {
  transactionDate: string;
  partyName: string;
  categoryId: string;
  siteId: string;
  qty: string;
  unitPrice: string;
  amount: string;
  paymentType: PaymentType;
  paymentMode: PaymentMode;
  paidAmount: string;
  description: string;
}

function emptyForm(): TransactionFormValues {
  return {
    transactionDate: new Date().toISOString().split("T")[0],
    partyName: "",
    categoryId: "",
    siteId: "",
    qty: "",
    unitPrice: "",
    amount: "",
    paymentType: "full_paid",
    paymentMode: "cash",
    paidAmount: "",
    description: "",
  };
}

function formatCurrency(value: number | undefined): string {
  if (value === undefined || Number.isNaN(value)) return DASH;
  return `₹${value.toLocaleString("en-IN")}`;
}

function formatDate(value: string): string {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

function filterTransactions(transactions: ExpenseTransaction[], filter: FilterType): ExpenseTransaction[] {
  if (filter === "ALL") return transactions;
  return transactions.filter((t) => t.type === filter);
}

interface FinanceSummaryCardProps {
  label: string;
  value: string;
  icon: typeof Wallet;
  tint: string;
  loading: boolean;
  index: number;
  emphasis?: boolean;
}

function FinanceSummaryCard({ label, value, icon: Icon, tint, loading, index, emphasis }: FinanceSummaryCardProps) {
  return (
    <GlowCard index={index} ambient={emphasis} className="flex items-center justify-between gap-3 p-5">
      <div className="min-w-0">
        <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
        <p className={cn("mt-1.5 font-bold tabular-nums text-foreground", emphasis ? "text-[26px]" : "text-[22px]")}>
          {loading ? "…" : value}
        </p>
      </div>
      <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tint)}>
        <Icon className="h-5 w-5" />
      </span>
    </GlowCard>
  );
}

export default function ExpenseTracker() {
  const { session } = useAuth();
  const leaderId = session?.userId;

  const amountQuery = useExpenseAmount(leaderId);
  const transactionsQuery = useExpenseTransactions(leaderId);
  const sitesQuery = useSites(leaderId);

  const [filterType, setFilterType] = useState<FilterType>("ALL");
  const [formOpen, setFormOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<ExpenseTransaction | null>(null);
  const [transactionType, setTransactionType] = useState<TxnType>("expense");
  const [form, setForm] = useState<TransactionFormValues>(emptyForm());
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const categoriesQuery = useExpenseCategories(formOpen ? transactionType : null);
  const addTransaction = useAddExpenseTransaction(leaderId);
  const updateTransaction = useUpdateExpenseTransaction(leaderId);
  const deleteTransaction = useDeleteExpenseTransaction();
  const submitting = addTransaction.isPending || updateTransaction.isPending;

  const transactions = useMemo(() => transactionsQuery.data ?? [], [transactionsQuery.data]);
  const filteredTransactions = useMemo(() => filterTransactions(transactions, filterType), [transactions, filterType]);
  const sites = sitesQuery.data ?? [];
  const categories = categoriesQuery.data ?? [];

  const siteNameById = useMemo(() => {
    const map = new Map<number, string>();
    (sitesQuery.data ?? []).forEach((s) => map.set(s.siteId, s.siteName));
    return map;
  }, [sitesQuery.data]);

  const selectedCategory = categories.find((c) => String(c.id) === form.categoryId);
  const isAdvance = transactionType === "income" && selectedCategory?.name === ADVANCE_CATEGORY_NAME;

  const updateForm = (patch: Partial<TransactionFormValues>) => setForm((prev) => ({ ...prev, ...patch }));

  const qtyTimesUnitPrice = () => {
    const qty = Number(form.qty) || 0;
    const unitPrice = Number(form.unitPrice) || 0;
    return qty > 0 && unitPrice > 0 ? qty * unitPrice : null;
  };
  const amountFromQtyUnitPrice = qtyTimesUnitPrice();
  const effectiveAmount = transactionType === "expense" && amountFromQtyUnitPrice !== null
    ? amountFromQtyUnitPrice
    : Number(form.amount) || 0;
  const amountLocked = transactionType === "expense" && amountFromQtyUnitPrice !== null;

  const computedPaidAmount = (() => {
    if (form.paymentType === "unpaid") return 0;
    if (form.paymentType === "full_paid") return effectiveAmount;
    return Number(form.paidAmount) || 0;
  })();
  const computedRemaining = Math.max(effectiveAmount - computedPaidAmount, 0);

  const resetAndOpen = (type: TxnType) => {
    setEditingTransaction(null);
    setTransactionType(type);
    setForm(emptyForm());
    addTransaction.reset();
    updateTransaction.reset();
    setFormOpen(true);
  };

  const openEdit = (t: ExpenseTransaction) => {
    setEditingTransaction(t);
    setTransactionType(t.type === "INCOME" ? "income" : "expense");
    setForm({
      transactionDate: t.transactionDate,
      partyName: t.partyName ?? "",
      categoryId: String(t.categoryId),
      siteId: String(t.siteId),
      qty: t.quantity != null ? String(t.quantity) : "",
      unitPrice: t.unitPrice != null ? String(t.unitPrice) : "",
      amount: String(t.grossAmount ?? t.amount),
      paymentType: (t.paymentType?.toLowerCase() as PaymentType) ?? "full_paid",
      paymentMode: (t.paymentMode?.toLowerCase() as PaymentMode) ?? "cash",
      paidAmount: t.paidAmount != null ? String(t.paidAmount) : "",
      description: t.description ?? "",
    });
    addTransaction.reset();
    updateTransaction.reset();
    setFormOpen(true);
  };

  const closeForm = () => {
    if (submitting) return;
    setFormOpen(false);
    setEditingTransaction(null);
  };

  const onSubmit = () => {
    if (submitting) return;

    if (!effectiveAmount) {
      toast.error("Amount is required");
      return;
    }
    if (!form.categoryId) {
      toast.error("Category is required");
      return;
    }
    if (!form.siteId) {
      toast.error("Site is required");
      return;
    }
    if (!form.transactionDate) {
      toast.error("Transaction date is required");
      return;
    }
    if (transactionType === "expense" && form.paymentType === "partial") {
      if (computedPaidAmount <= 0) {
        toast.error("Paid amount is required for a partial payment");
        return;
      }
      if (computedPaidAmount > effectiveAmount) {
        toast.error("Paid amount cannot be greater than the total");
        return;
      }
    }

    const body = new FormData();
    body.append("transactionDate", form.transactionDate);
    body.append("categoryId", form.categoryId);
    body.append("amount", String(effectiveAmount));
    body.append("partyName", form.partyName);
    body.append("siteId", form.siteId);
    body.append("description", form.description);

    if (transactionType === "expense") {
      body.append("paymentType", form.paymentType.toUpperCase());
      body.append("paymentMode", form.paymentMode.toUpperCase());
      body.append("paidAmount", String(computedPaidAmount));
      if (form.qty) body.append("qty", form.qty);
      if (form.unitPrice) body.append("unitPrice", form.unitPrice);
    } else {
      body.append("paymentType", "FULL_PAID");
      body.append("paymentMode", form.paymentMode.toUpperCase());
      body.append("advanceFlag", String(isAdvance));
      if (isAdvance) {
        body.append("advanceAmount", String(effectiveAmount));
      } else {
        body.append("paidAmount", String(effectiveAmount));
      }
    }

    if (editingTransaction) {
      updateTransaction.mutate(
        { type: transactionType, id: editingTransaction.id, body },
        {
          onSuccess: () => {
            toast.success("Transaction updated");
            setFormOpen(false);
            setEditingTransaction(null);
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Could not update transaction");
          },
        },
      );
    } else {
      addTransaction.mutate(
        { type: transactionType, body },
        {
          onSuccess: () => {
            toast.success("Transaction added");
            setFormOpen(false);
          },
          onError: (err) => {
            toast.error(err instanceof Error ? err.message : "Could not add transaction");
          },
        },
      );
    }
  };

  const confirmDelete = () => {
    if (deleteId === null) return;
    deleteTransaction.mutate(deleteId, {
      onSuccess: () => {
        toast.success("Transaction deleted");
        setDeleteId(null);
      },
      onError: (err) => {
        toast.error(err instanceof Error ? err.message : "Could not delete transaction");
        setDeleteId(null);
      },
    });
  };

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Employer"
        title="Expense Tracker"
        trailing={
          <Button size="sm" onClick={() => resetAndOpen("expense")}>
            <Plus className="mr-2 h-4 w-4" /> Add
          </Button>
        }
      />

      {/* Angular's expense-tracker.component.html renders exactly these 5
          cards — Advance Used and Advance Remaining are computed by the
          component but HTML-commented out of the real template, so they
          are correctly left out here too. No chart panels exist in this
          template (unlike Enterprise's own decorative source), so none are
          added here. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <FinanceSummaryCard
          label="Available Balance"
          value={formatCurrency(amountQuery.data?.availableBalance)}
          icon={Wallet}
          tint="bg-blue-50 text-blue-600"
          loading={amountQuery.isLoading}
          index={0}
          emphasis
        />
        <FinanceSummaryCard
          label="Total Received"
          value={formatCurrency(amountQuery.data?.totalReceived)}
          icon={ArrowUpRight}
          tint="bg-emerald-50 text-emerald-600"
          loading={amountQuery.isLoading}
          index={1}
        />
        <FinanceSummaryCard
          label="Total Spent"
          value={formatCurrency(amountQuery.data?.totalSpent)}
          icon={ArrowDownRight}
          tint="bg-rose-50 text-rose-600"
          loading={amountQuery.isLoading}
          index={2}
        />
        <FinanceSummaryCard
          label="Total Dues"
          value={formatCurrency(amountQuery.data?.totalDue)}
          icon={CircleAlert}
          tint="bg-amber-50 text-amber-600"
          loading={amountQuery.isLoading}
          index={3}
        />
        <FinanceSummaryCard
          label="Advance Given"
          value={formatCurrency(amountQuery.data?.advanceGiven)}
          icon={Landmark}
          tint="bg-violet-50 text-violet-600"
          index={4}
          loading={amountQuery.isLoading}
        />
      </div>

      <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4 p-6 pb-4">
          <h3 className="text-lg font-bold">Transaction History</h3>
          <Select value={filterType} onValueChange={(v) => setFilterType(v as FilterType)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Transactions</SelectItem>
              <SelectItem value="INCOME">Income</SelectItem>
              <SelectItem value="EXPENSE">Expense</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <CardContent className="pt-0">
          {transactionsQuery.isLoading ? (
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <Skeleton key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : transactionsQuery.isError ? (
            <ErrorState
              message={
                transactionsQuery.error instanceof ApiError
                  ? transactionsQuery.error.message
                  : "Could not load transactions."
              }
              onRetry={() => transactionsQuery.refetch()}
            />
          ) : filteredTransactions.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[hsl(var(--accent)/0.1)] text-[hsl(var(--accent))]">
                <Inbox className="h-6 w-6" />
              </span>
              <p className="text-base font-semibold text-foreground">--- No transactions yet ---</p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredTransactions.map((t, i) => {
                const isIncome = t.type === "INCOME";
                return (
                  <AnimatedItem key={t.id} index={i} interactive className="flex items-center justify-between gap-4 py-3.5">
                    <div className="flex min-w-0 items-start gap-3">
                      <span
                        className={cn(
                          "mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full",
                          isIncome ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-600",
                        )}
                      >
                        {isIncome ? <TrendingUp className="h-4 w-4" /> : <TrendingDown className="h-4 w-4" />}
                      </span>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={cn(
                              "inline-block rounded-full px-2.5 py-0.5 text-xs font-semibold",
                              isIncome ? "bg-[#e5f8f0] text-[#17a085]" : "bg-[#fdeaec] text-[#e74c3c]",
                            )}
                          >
                            {t.categoryName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {siteNameById.get(t.siteId) ?? DASH}
                          </span>
                        </div>
                        <p className="mt-1 truncate text-sm text-foreground">{t.description || DASH}</p>
                        <p className="mt-0.5 text-xs text-muted-foreground">
                          {formatDate(t.transactionDate)}
                          {t.partyName ? ` • ${t.partyName}` : ""}
                        </p>
                      </div>
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <span
                        className={cn(
                          "min-w-[92px] text-right font-semibold tabular-nums",
                          isIncome ? "text-[#17a085]" : "text-[#e74c3c]",
                        )}
                      >
                        {isIncome ? "+" : "-"}
                        {formatCurrency(t.grossAmount ?? t.amount)}
                      </span>
                      <Button variant="ghost" size="icon" onClick={() => openEdit(t)} aria-label="Edit transaction">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(t.id)} aria-label="Delete transaction">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </AnimatedItem>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/*
        MUTATION NOT LIVE-VERIFIED, same as the shared Enterprise
        implementation this reuses — addExpenseTransaction/
        updateExpenseTransaction send multipart/form-data through the
        already-audited FormData-aware branch in httpClient.ts.
      */}
      <Dialog open={formOpen} onOpenChange={(open) => !open && closeForm()}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTransaction ? "Edit Transaction" : "New Transaction"}</DialogTitle>
            <DialogDescription>Record an income or expense entry for a site.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-2 rounded-xl bg-muted p-1.5">
            <button
              type="button"
              disabled={Boolean(editingTransaction)}
              onClick={() => setTransactionType("expense")}
              aria-pressed={transactionType === "expense"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                transactionType === "expense"
                  ? "bg-white text-rose-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <TrendingDown className="h-4 w-4" /> Expense
            </button>
            <button
              type="button"
              disabled={Boolean(editingTransaction)}
              onClick={() => setTransactionType("income")}
              aria-pressed={transactionType === "income"}
              className={cn(
                "flex items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold transition-all",
                transactionType === "income"
                  ? "bg-white text-emerald-600 shadow-sm"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <TrendingUp className="h-4 w-4" /> Income
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="et-date">Date</Label>
                <Input
                  id="et-date"
                  type="date"
                  max={new Date().toISOString().split("T")[0]}
                  value={form.transactionDate}
                  onChange={(e) => updateForm({ transactionDate: e.target.value })}
                  disabled={submitting}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="et-party">{transactionType === "income" ? "Received from" : "Party / Vendor"}</Label>
                <Input
                  id="et-party"
                  placeholder={transactionType === "income" ? "Client / party name" : "Vendor name"}
                  value={form.partyName}
                  onChange={(e) => updateForm({ partyName: e.target.value })}
                  disabled={submitting}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="et-category">{transactionType === "income" ? "Income type" : "Material / Item"}</Label>
                <Select value={form.categoryId} onValueChange={(v) => updateForm({ categoryId: v })} disabled={submitting}>
                  <SelectTrigger id="et-category">
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((c) => (
                      <SelectItem key={c.id} value={String(c.id)}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="et-site">Site</Label>
                <Select value={form.siteId} onValueChange={(v) => updateForm({ siteId: v })} disabled={submitting}>
                  <SelectTrigger id="et-site">
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {sites.map((s) => (
                      <SelectItem key={s.siteId} value={String(s.siteId)}>
                        {s.siteName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {transactionType === "expense" ? (
              <>
                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="et-qty">Qty</Label>
                    <Input
                      id="et-qty"
                      type="number"
                      value={form.qty}
                      onChange={(e) => updateForm({ qty: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="et-unit-price">Unit price</Label>
                    <Input
                      id="et-unit-price"
                      type="number"
                      value={form.unitPrice}
                      onChange={(e) => updateForm({ unitPrice: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label htmlFor="et-amount">Total</Label>
                    <div className="relative">
                      <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                        ₹
                      </span>
                      <Input
                        id="et-amount"
                        type="number"
                        className="pl-6 font-semibold tabular-nums"
                        value={amountLocked ? String(effectiveAmount) : form.amount}
                        onChange={(e) => updateForm({ amount: e.target.value })}
                        readOnly={amountLocked}
                        disabled={submitting}
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <span id="et-payment-type-label" className="text-sm font-medium leading-none">
                    Payment type
                  </span>
                  <div className="flex gap-2" role="group" aria-labelledby="et-payment-type-label">
                    {(["full_paid", "partial", "unpaid"] as const).map((pt) => (
                      <Button
                        key={pt}
                        type="button"
                        size="sm"
                        variant={form.paymentType === pt ? "default" : "outline"}
                        onClick={() => updateForm({ paymentType: pt })}
                        disabled={submitting}
                        aria-pressed={form.paymentType === pt}
                        className="flex-1"
                      >
                        {pt === "full_paid" ? "Full Paid" : pt === "partial" ? "Partial" : "Unpaid"}
                      </Button>
                    ))}
                  </div>
                </div>

                {form.paymentType === "partial" && (
                  <div className="grid grid-cols-2 gap-4 rounded-xl bg-muted/50 p-3.5">
                    <div className="space-y-1.5">
                      <Label htmlFor="et-paid">Paid amount</Label>
                      <Input
                        id="et-paid"
                        type="number"
                        value={form.paidAmount}
                        onChange={(e) => updateForm({ paidAmount: e.target.value })}
                        disabled={submitting}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label>Remaining</Label>
                      <Input value={computedRemaining} readOnly disabled className="font-semibold tabular-nums" />
                    </div>
                  </div>
                )}

                {form.paymentType !== "unpaid" && (
                  <div className="space-y-1.5">
                    <span id="et-payment-mode-label-expense" className="text-sm font-medium leading-none">
                      Payment mode
                    </span>
                    <div className="flex gap-2" role="group" aria-labelledby="et-payment-mode-label-expense">
                      {(["cash", "upi", "bank"] as const).map((pm) => (
                        <Button
                          key={pm}
                          type="button"
                          size="sm"
                          variant={form.paymentMode === pm ? "default" : "outline"}
                          onClick={() => updateForm({ paymentMode: pm })}
                          disabled={submitting}
                          aria-pressed={form.paymentMode === pm}
                          className="flex-1"
                        >
                          {pm.toUpperCase()}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
              </>
            ) : (
              <>
                <div className="space-y-1.5">
                  <Label htmlFor="et-income-amount">Total amount received</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                      ₹
                    </span>
                    <Input
                      id="et-income-amount"
                      type="number"
                      className="pl-6 font-semibold tabular-nums"
                      value={form.amount}
                      onChange={(e) => updateForm({ amount: e.target.value })}
                      disabled={submitting}
                    />
                  </div>
                  {isAdvance && (
                    <p className="rounded-md bg-violet-50 px-2.5 py-1.5 text-xs text-violet-700">
                      "{ADVANCE_CATEGORY_NAME}" category selected — recorded as an advance, not a direct payment.
                    </p>
                  )}
                </div>
                <div className="space-y-1.5">
                  <span id="et-payment-mode-label-income" className="text-sm font-medium leading-none">
                    Payment mode
                  </span>
                  <div className="flex gap-2" role="group" aria-labelledby="et-payment-mode-label-income">
                    {(["cash", "upi", "bank"] as const).map((pm) => (
                      <Button
                        key={pm}
                        type="button"
                        size="sm"
                        variant={form.paymentMode === pm ? "default" : "outline"}
                        onClick={() => updateForm({ paymentMode: pm })}
                        disabled={submitting}
                        aria-pressed={form.paymentMode === pm}
                        className="flex-1"
                      >
                        {pm.toUpperCase()}
                      </Button>
                    ))}
                  </div>
                </div>
              </>
            )}

            <div className="space-y-1.5">
              <Label htmlFor="et-description">Description</Label>
              <Textarea
                id="et-description"
                rows={3}
                placeholder="Optional notes..."
                value={form.description}
                onChange={(e) => updateForm({ description: e.target.value })}
                disabled={submitting}
              />
            </div>

            {(addTransaction.error || updateTransaction.error) && (
              <p className="rounded-md bg-destructive/10 px-3 py-2 text-sm text-destructive">
                {(editingTransaction ? updateTransaction.error : addTransaction.error) instanceof Error
                  ? (editingTransaction ? updateTransaction.error : addTransaction.error)?.message
                  : "Something went wrong"}
              </p>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeForm} disabled={submitting}>
              Cancel
            </Button>
            <Button onClick={onSubmit} disabled={submitting}>
              {submitting ? "Saving..." : editingTransaction ? "Update Transaction" : "Save Transaction"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Transaction</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete?</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteTransaction.isPending}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={deleteTransaction.isPending}>
              {deleteTransaction.isPending ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
