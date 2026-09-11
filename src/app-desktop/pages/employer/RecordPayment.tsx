import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { IndianRupee } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
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
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { EmptyState } from "@/app-desktop/components/shared/EmptyState";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";
import { AnimatedItem } from "@/app-desktop/components/fx/AnimatedList";
import { useAuth } from "@/app-desktop/auth/useAuth";
import {
  useEmployerAttendanceHistory,
  useEmployerAttendanceWorkers,
  useEmployerEmployeeBalance,
  useEmployerPaymentHistory,
  useProcessEmployerPayment,
} from "@/app-desktop/hooks/useEmployerAttendance";
import { ApiError } from "@/app-desktop/api/httpClient";

type PaymentMode = "cash" | "bank" | "upi";

const PAYMENT_MODE_LABEL: Record<PaymentMode, string> = { cash: "Cash", bank: "Bank Transfer", upi: "UPI" };

// Angular's mapAttendanceStatus() — ONE_AND_HALF_DAY/DOUBLE_DAY both display
// as "Present" on this history list (record-payment.component.ts).
function mapAttendanceStatus(status: string | undefined): string {
  const map: Record<string, string> = {
    PRESENT: "Present",
    HALF_DAY: "Half Day",
    ABSENT: "Absent",
    ONE_AND_HALF_DAY: "Present",
    DOUBLE_DAY: "Present",
  };
  return map[(status ?? "").toUpperCase()] ?? "Present";
}

function formatDisplayDate(value: string | undefined): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export default function RecordPayment() {
  const { workerId } = useParams<{ workerId: string }>();
  const { session } = useAuth();
  const leaderId = session?.parentId ? Number(session.parentId) : 0;

  const [amount, setAmount] = useState("");
  const [paymentDate, setPaymentDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [paymentMode, setPaymentMode] = useState<PaymentMode>("cash");
  const [comment, setComment] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);

  const workersQuery = useEmployerAttendanceWorkers(session?.parentId, "all", leaderId);
  const balanceQuery = useEmployerEmployeeBalance(workerId ?? "", session?.parentId);
  const attendanceHistoryQuery = useEmployerAttendanceHistory(workerId ?? "");
  const paymentHistoryQuery = useEmployerPaymentHistory(workerId ?? "");
  const processPayment = useProcessEmployerPayment(workerId ?? "");

  const worker = useMemo(
    () => (workersQuery.data ?? []).find((w) => String(w.userId) === String(workerId)),
    [workersQuery.data, workerId],
  );

  const balance = balanceQuery.data;
  const totalEarnings = balance?.totalEarnings ?? 0;
  const paymentsMade = balance?.paymentsMade ?? 0;
  const advancePayment = balance?.advancePayment ?? 0;
  const remaining = balance?.remaining ?? 0;
  const totalPaid = paymentsMade + advancePayment;
  const paymentPercentage = totalEarnings === 0 ? 0 : Math.round((totalPaid / totalEarnings) * 100);

  const attendanceHistory = (attendanceHistoryQuery.data ?? []).map((r) => ({
    date: formatDisplayDate((r as { date?: string; createdAt?: string }).date ?? (r as { createdAt?: string }).createdAt),
    status: mapAttendanceStatus((r as { status?: string }).status),
    earnings: Number((r as { earnings?: number }).earnings ?? 0),
  }));

  const paymentHistory = (paymentHistoryQuery.data ?? []).map((p) => ({
    date: formatDisplayDate(
      (p as { paymentDate?: string; date?: string; createdAt?: string }).paymentDate ??
        (p as { date?: string }).date ??
        (p as { createdAt?: string }).createdAt,
    ),
    amount: Number((p as { amountPaid?: number; amount?: number }).amountPaid ?? (p as { amount?: number }).amount ?? 0),
    mode: PAYMENT_MODE_LABEL[((p as { paymentMode?: string; mode?: string }).paymentMode ??
      (p as { mode?: string }).mode ??
      "cash"
    ).toLowerCase() as PaymentMode] ?? String((p as { paymentMode?: string }).paymentMode ?? ""),
    comment: (p as { remarks?: string; comment?: string }).remarks ?? (p as { comment?: string }).comment ?? "",
  }));

  const loading = workersQuery.isLoading || balanceQuery.isLoading;

  const submitPayment = () => {
    const parsed = parseFloat(amount);
    if (!amount || parsed <= 0) {
      toast.error("Please enter a valid payment amount");
      return;
    }
    if (!session?.userId) {
      toast.error("Admin ID not found. Please log in again.");
      return;
    }
    setConfirmOpen(true);
  };

  const confirmPayment = () => {
    setConfirmOpen(false);
    processPayment.mutate(
      {
        userId: Number(workerId),
        amount: parseFloat(amount),
        paymentMode: PAYMENT_MODE_LABEL[paymentMode],
        paymentDate,
        remarks: comment,
        adminId: session!.userId,
      },
      {
        onSuccess: (res) => {
          if (res.success === false) {
            toast.error(res.message ?? "Payment failed");
            return;
          }
          toast.success("Payment recorded successfully");
          setAmount("");
          setComment("");
          setPaymentMode("cash");
          setPaymentDate(new Date().toISOString().split("T")[0]);
        },
        onError: () => {
          toast.error("Failed to record payment. Please try again.");
        },
      },
    );
  };

  if (!workerId) {
    return <ErrorState message="Worker ID is required." />;
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Employer"
        title="Record Payment"
        backTo="/dashboard/employer/attendance"
        backLabel="Back to attendance"
      />

      {workersQuery.isError ? (
        <ErrorState
          message={workersQuery.error instanceof ApiError ? workersQuery.error.message : "Could not load worker."}
          onRetry={() => workersQuery.refetch()}
        />
      ) : loading ? (
        <div className="space-y-4">
          <Skeleton className="h-24 w-full rounded-2xl" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
      ) : !worker ? (
        <EmptyState title="Worker not found" description="This worker may have been removed." />
      ) : (
        <>
          <GlowCard ambient index={0} className="p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-foreground">{worker.name}</h2>
                <p className="text-sm text-muted-foreground">{worker.role}</p>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-foreground">₹{worker.dailyRate.toLocaleString()}</div>
                <div className="text-xs text-muted-foreground">per day</div>
              </div>
            </div>
          </GlowCard>

          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
            <GlowCard index={1} className="p-4 text-center">
              <div className="text-lg font-bold text-foreground">₹{totalEarnings.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">Total earnings</div>
            </GlowCard>
            <GlowCard index={2} className="bg-blue-50 p-4 text-center">
              <div className="text-lg font-bold text-blue-600">₹{paymentsMade.toLocaleString()}</div>
              <div className="text-xs text-blue-600">Paid</div>
            </GlowCard>
            <GlowCard index={3} className="border-red-100 bg-red-50 p-4 text-center">
              <div className="text-lg font-bold text-red-600">₹{remaining.toLocaleString()}</div>
              <div className="text-xs font-semibold text-red-600">Remaining</div>
            </GlowCard>
            <GlowCard index={4} className="border-emerald-100 bg-emerald-50 p-4 text-center">
              <div className="text-lg font-bold text-emerald-600">{paymentPercentage}%</div>
              <div className="text-xs text-emerald-600">Completed</div>
            </GlowCard>
          </div>

          {advancePayment > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-amber-50 px-4 py-3 text-sm">
              <span className="font-medium text-amber-700">Advance</span>
              <span className="font-semibold text-amber-700">₹{advancePayment.toLocaleString()}</span>
            </div>
          )}

          <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <div className="mb-4 flex items-center gap-2">
              <IndianRupee className="h-4 w-4 text-muted-foreground" />
              <h3 className="text-sm font-semibold text-foreground">Record Payment</h3>
            </div>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                submitPayment();
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-1.5">
                  <Label htmlFor="rp-amount">Amount (₹)</Label>
                  <Input
                    id="rp-amount"
                    type="number"
                    min={0}
                    placeholder="0"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    disabled={processPayment.isPending}
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="rp-date">Date</Label>
                  <Input
                    id="rp-date"
                    type="date"
                    max={new Date().toISOString().split("T")[0]}
                    value={paymentDate}
                    onChange={(e) => setPaymentDate(e.target.value)}
                    disabled={processPayment.isPending}
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <span id="rp-mode-label" className="text-sm font-medium leading-none">
                  Mode
                </span>
                <div role="group" aria-labelledby="rp-mode-label" className="flex gap-2">
                  {(Object.keys(PAYMENT_MODE_LABEL) as PaymentMode[]).map((mode) => (
                    <Button
                      key={mode}
                      type="button"
                      variant={paymentMode === mode ? "default" : "outline"}
                      size="sm"
                      aria-pressed={paymentMode === mode}
                      disabled={processPayment.isPending}
                      onClick={() => setPaymentMode(mode)}
                    >
                      {PAYMENT_MODE_LABEL[mode]}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="rp-comment">Note (optional)</Label>
                <Textarea
                  id="rp-comment"
                  placeholder="Add notes..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  disabled={processPayment.isPending}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={processPayment.isPending}>
                  {processPayment.isPending ? "Processing..." : "Record"}
                </Button>
              </div>
            </form>
          </div>

          <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <Tabs defaultValue="attendance">
              <TabsList>
                <TabsTrigger value="attendance">Attendance</TabsTrigger>
                <TabsTrigger value="payments">Payments</TabsTrigger>
              </TabsList>
              <TabsContent value="attendance" className="mt-4 space-y-2">
                {attendanceHistory.length === 0 ? (
                  <EmptyState title="No attendance history found" />
                ) : (
                  attendanceHistory.map((record, i) => (
                    <AnimatedItem
                      key={i}
                      index={i}
                      interactive
                      className="flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
                    >
                      <div>
                        <div className="font-medium">{record.date}</div>
                        <div className="text-xs text-muted-foreground">{record.status}</div>
                      </div>
                      {record.earnings > 0 && <span className="font-semibold">₹{record.earnings.toLocaleString()}</span>}
                    </AnimatedItem>
                  ))
                )}
              </TabsContent>
              <TabsContent value="payments" className="mt-4 space-y-2">
                {paymentHistory.length === 0 ? (
                  <EmptyState title="No payment history found" />
                ) : (
                  paymentHistory.map((payment, i) => (
                    <AnimatedItem key={i} index={i} interactive className="rounded-lg border px-3 py-2 text-sm">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{payment.date}</div>
                          <div className="text-xs text-muted-foreground">{payment.mode}</div>
                        </div>
                        <span className="font-semibold">₹{payment.amount.toLocaleString()}</span>
                      </div>
                      {payment.comment && <div className="mt-1 text-xs text-muted-foreground">{payment.comment}</div>}
                    </AnimatedItem>
                  ))
                )}
              </TabsContent>
            </Tabs>
          </div>
        </>
      )}

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Record payment?</AlertDialogTitle>
            <AlertDialogDescription>
              Record a payment of ₹{amount} for {worker?.name}?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmPayment}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
