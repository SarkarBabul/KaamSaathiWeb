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
  Receipt,
  Trash2,
  TrendingDown,
  TrendingUp,
  Wallet,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from "recharts";
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
import { ChartCard } from "@/app-desktop/components/dashboard/ChartCard";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
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

// Real (legacy employer) Angular source's live-rendered category name that
// flips a transaction into advance handling — expense-tracker.component.ts:
// `const isAdvance = category?.name === 'Advance Received'`. Not a magic
// string invented here; it only works if the backend's categories list
// happens to contain a category with this exact name.
const ADVANCE_CATEGORY_NAME = "Advance Received";

// A category/site name legitimately absent on a record is rendered as
// this exact placeholder throughout — never blank, never fabricated.
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

// A small, restrained palette reused for both the category-breakdown
// donut and the payment-type/mode selectors below — not an attempt at a
// full design-token system, just enough distinct, legible colors for a
// handful of categories.
const CATEGORY_COLORS = ["#2f7fe0", "#17a085", "#e0a83f", "#e0623f", "#8b3fe0", "#3fb6e0", "#c93f7e", "#5fa83f"];

interface FinanceSummaryCardProps {
  label: string;
  value: string;
  icon: typeof Wallet;
  tint: string;
  loading: boolean;
}

function FinanceSummaryCard({ label, value, icon: Icon, tint, loading }: FinanceSummaryCardProps) {
  return (
    <Card className="motion-safe:animate-in motion-safe:fade-in motion-safe:slide-in-from-bottom-1 rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)] transition-shadow duration-200 hover:shadow-[0_6px_20px_rgba(0,0,0,0.08)]">
      <CardContent className="flex items-center justify-between gap-3 p-5">
        <div className="min-w-0">
          <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1.5 text-[22px] font-bold tabular-nums text-foreground">{loading ? "…" : value}</p>
        </div>
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", tint)}>
          <Icon className="h-5 w-5" />
        </span>
      </CardContent>
    </Card>
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

  // Derived strictly from the already-fetched `transactions` array — no
  // extra API call, no fabricated figures. Gated entirely off real data:
  // when there are zero transactions, no chart is rendered at all (see
  // the empty-state branch below) rather than showing a misleading
  // flat/zero chart.
  const incomeVsExpenseData = useMemo(() => {
    const totals = transactions.reduce(
      (acc, t) => {
        const amt = t.grossAmount ?? t.amount ?? 0;
        if (t.type === "INCOME") acc.income += amt;
        else acc.expense += amt;
        return acc;
      },
      { income: 0, expense: 0 },
    );
    return [
      { name: "Income", value: totals.income, fill: "#17a085" },
      { name: "Expense", value: totals.expense, fill: "#e0623f" },
    ];
  }, [transactions]);

  const categoryBreakdown = useMemo(() => {
    const totals = new Map<string, number>();
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const key = t.categoryName || "Uncategorized";
        totals.set(key, (totals.get(key) ?? 0) + (t.grossAmount ?? t.amount ?? 0));
      });
    return Array.from(totals.entries())
      .map(([name, value], i) => ({ name, value, fill: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }))
      .sort((a, b) => b.value - a.value);
  }, [transactions]);

  const selectedCategory = categories.find((c) => String(c.id) === form.categoryId);
  const isAdvance = transactionType === "income" && selectedCategory?.name === ADVANCE_CATEGORY_NAME;

  const updateForm = (patch: Partial<TransactionFormValues>) => setForm((prev) => ({ ...prev, ...patch }));

  // Angular's calculateTotal(): amount = qty * unitPrice, expense only,
  // read-only total input once both are > 0.
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

  // Deliberately deterministic, not a byte-for-byte port of Angular's
  // saveTransaction(): the real component ends with an
  // `Object.entries(data).forEach(...formData.set(key, ...))` pass that
  // re-flattens every raw reactive-form control (including the untouched
  // `paidAmount: [0]` default) back onto the already-computed FormData —
  // which, if the user never clicks a payment-type button, silently
  // overwrites a correctly-computed "full paid" paidAmount back down to 0.
  // That is a real, confirmed bug in the live source (Phase 3D audit), not
  // a contract requirement — reproducing it exactly was judged not worth
  // shipping a known-broken default path. This computes the field the
  // Angular UI *intends* for each payment type instead.
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

    // Same required-field checks as Angular's saveTransaction() snackbar
    // validation (amount/category/site/date), surfaced via toast instead.
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

    // Field names match ExpenseTrackerService's real FormData body exactly
    // (Phase 3D source audit). `leaderId` is NOT appended here — it's
    // attached by useAddExpenseTransaction/useUpdateExpenseTransaction
    // (see useExpenseTracker.ts), sourced from the authenticated session,
    // never entered by the user.
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

  const hasActivity = transactions.length > 0;

  return (
    <div className="space-y-5">
      <PageHeader
        eyebrow="Super Admin"
        title="Expense Tracker"
        trailing={
          <Button size="sm" onClick={() => resetAndOpen("expense")} className="motion-safe:animate-in motion-safe:fade-in">
            <Plus className="mr-2 h-4 w-4" /> Add Transaction
          </Button>
        }
      />
      <p className="-mt-4 max-w-xl text-sm text-muted-foreground">
        Monitor spending, income and transaction activity across your sites.
      </p>

      {/* Angular's live template renders exactly these 5 cards — Advance
          Used and Advance Remaining are computed by the component but
          HTML-commented out of the real template, so they are correctly
          left out here too rather than presented as if they were live. */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <FinanceSummaryCard
          label="Total Received"
          value={formatCurrency(amountQuery.data?.totalReceived)}
          icon={ArrowUpRight}
          tint="bg-emerald-50 text-emerald-600"
          loading={amountQuery.isLoading}
        />
        <FinanceSummaryCard
          label="Total Spent"
          value={formatCurrency(amountQuery.data?.totalSpent)}
          icon={ArrowDownRight}
          tint="bg-rose-50 text-rose-600"
          loading={amountQuery.isLoading}
        />
        <FinanceSummaryCard
          label="Available Balance"
          value={formatCurrency(amountQuery.data?.availableBalance)}
          icon={Wallet}
          tint="bg-blue-50 text-blue-600"
          loading={amountQuery.isLoading}
        />
        <FinanceSummaryCard
          label="Total Dues"
          value={formatCurrency(amountQuery.data?.totalDue)}
          icon={CircleAlert}
          tint="bg-amber-50 text-amber-600"
          loading={amountQuery.isLoading}
        />
        <FinanceSummaryCard
          label="Advance Given"
          value={formatCurrency(amountQuery.data?.advanceGiven)}
          icon={Landmark}
          tint="bg-violet-50 text-violet-600"
          loading={amountQuery.isLoading}
        />
      </div>

      {/* Both charts below are derived entirely from the already-fetched
          `transactions` array — no extra API call, no invented figures.
          With zero transactions there is nothing honest to plot, so this
          renders one elegant empty panel instead of a flat/misleading
          zero-value chart. */}
      {hasActivity ? (
        <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
          <ChartCard title="Income vs Expense" subtitle="Totals across every recorded transaction">
            <div className="h-[220px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={incomeVsExpenseData} margin={{ top: 4, right: 8, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#eee" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9aa5b1" }} />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: "#9aa5b1" }} />
                  <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                  <Bar dataKey="value" radius={[6, 6, 0, 0]} barSize={64}>
                    {incomeVsExpenseData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </ChartCard>

          <ChartCard title="Spending by Category" subtitle="Expense transactions grouped by category">
            {categoryBreakdown.length === 0 ? (
              <div className="flex h-[220px] flex-col items-center justify-center gap-2 text-center">
                <Receipt className="h-7 w-7 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">No expense categories recorded yet.</p>
              </div>
            ) : (
              <div className="h-[220px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      dataKey="value"
                      nameKey="name"
                      innerRadius="55%"
                      outerRadius="85%"
                      stroke="none"
                    >
                      {categoryBreakdown.map((entry) => (
                        <Cell key={entry.name} fill={entry.fill} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value: number) => formatCurrency(value)} />
                    <Legend
                      verticalAlign="bottom"
                      iconType="circle"
                      wrapperStyle={{ fontSize: 11, color: "#6b7280" }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </ChartCard>
        </div>
      ) : (
        <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
          <CardContent className="flex flex-col items-center justify-center gap-2 py-12 text-center">
            <TrendingUp className="h-8 w-8 text-muted-foreground/40" />
            <p className="font-medium text-foreground">No activity to visualize yet</p>
            <p className="max-w-sm text-sm text-muted-foreground">
              Income vs. expense and category breakdown charts will appear here once you record your first
              transaction.
            </p>
          </CardContent>
        </Card>
      )}

      <Card className="rounded-2xl border-none shadow-[0_2px_10px_rgba(0,0,0,0.05)]">
        <div className="flex flex-row flex-wrap items-center justify-between gap-4 p-6 pb-4">
          <div>
            <h3 className="text-lg font-bold">Transaction History</h3>
            <p className="text-sm text-muted-foreground">A complete ledger of income and expense entries.</p>
          </div>
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
              <span className="flex h-14 w-14 items-center justify-center rounded-full bg-muted">
                <Inbox className="h-6 w-6 text-muted-foreground/60" />
              </span>
              <p className="text-base font-semibold text-foreground">
                {transactions.length === 0 ? "Your ledger is clear" : "No transactions match this filter"}
              </p>
              <p className="max-w-sm text-sm text-muted-foreground">
                {transactions.length === 0
                  ? "No income or expenses have been recorded yet."
                  : "Try a different filter to see more of your transaction history."}
              </p>
              {transactions.length === 0 && (
                <Button size="sm" className="mt-1" onClick={() => resetAndOpen("expense")}>
                  <Plus className="mr-2 h-4 w-4" /> Add Transaction
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y">
              {filteredTransactions.map((t) => {
                const isIncome = t.type === "INCOME";
                return (
                  <div
                    key={t.id}
                    className="motion-safe:animate-in motion-safe:fade-in flex items-center justify-between gap-4 py-3.5 transition-colors hover:bg-muted/40"
                  >
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
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/*
        MUTATION NOT LIVE-VERIFIED. addExpenseTransaction/
        updateExpenseTransaction send multipart/form-data — httpClient.ts's
        request() now has a FormData-aware branch that passes such bodies
        to fetch() unmodified (see httpClient.ts), so submitting this form
        would no longer send a malformed request purely on the
        serialization front. It has still never been exercised against the
        real backend — that requires separate, explicit authorization
        before any live mutation test, per the Phase 3D instructions.
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
                <Label>{transactionType === "income" ? "Income type" : "Material / Item"}</Label>
                <Select value={form.categoryId} onValueChange={(v) => updateForm({ categoryId: v })} disabled={submitting}>
                  <SelectTrigger>
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
                <Label>Site</Label>
                <Select value={form.siteId} onValueChange={(v) => updateForm({ siteId: v })} disabled={submitting}>
                  <SelectTrigger>
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
                  <Label>Payment type</Label>
                  <div className="flex gap-2">
                    {(["full_paid", "partial", "unpaid"] as const).map((pt) => (
                      <Button
                        key={pt}
                        type="button"
                        size="sm"
                        variant={form.paymentType === pt ? "default" : "outline"}
                        onClick={() => updateForm({ paymentType: pt })}
                        disabled={submitting}
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
                    <Label>Payment mode</Label>
                    <div className="flex gap-2">
                      {(["cash", "upi", "bank"] as const).map((pm) => (
                        <Button
                          key={pm}
                          type="button"
                          size="sm"
                          variant={form.paymentMode === pm ? "default" : "outline"}
                          onClick={() => updateForm({ paymentMode: pm })}
                          disabled={submitting}
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
                  <Label>Payment mode</Label>
                  <div className="flex gap-2">
                    {(["cash", "upi", "bank"] as const).map((pm) => (
                      <Button
                        key={pm}
                        type="button"
                        size="sm"
                        variant={form.paymentMode === pm ? "default" : "outline"}
                        onClick={() => updateForm({ paymentMode: pm })}
                        disabled={submitting}
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

      {/* MUTATION NOT LIVE-VERIFIED / NOT EXECUTED during Phase 3D — the
          endpoint itself (plain DELETE, no body) is not affected by the
          FormData gap above, but was still not exercised without explicit
          authorization per this phase's instructions. */}
      <AlertDialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete transaction</AlertDialogTitle>
            <AlertDialogDescription>Are you sure you want to delete this transaction?</AlertDialogDescription>
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
