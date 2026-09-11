import { useState } from "react";
import { toast } from "sonner";
import { Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { PageHeader } from "@/app-desktop/components/shared/PageHeader";
import { ErrorState } from "@/app-desktop/components/shared/ErrorState";
import { GlowCard } from "@/app-desktop/components/fx/GlowCard";
import { useAuth } from "@/app-desktop/auth/useAuth";
import { useCreateEmployerPaymentOrder, useEmployerPlans, useVerifyEmployerPayment } from "@/app-desktop/hooks/useEmployerPricing";
import { ApiError } from "@/app-desktop/api/httpClient";
import type { EmployerPlan } from "@/app-desktop/types/employerPricing";

type BillingCycle = "monthly" | "yearly";

interface RazorpayCheckoutOptions {
  key: string;
  amount: number;
  name: string;
  order_id: string;
  prefill: { contact: string };
  handler: (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) => void;
  theme: { color: string };
}

interface RazorpayCheckout {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay?: new (options: RazorpayCheckoutOptions) => RazorpayCheckout;
  }
}

const RAZORPAY_SCRIPT_SRC = "https://checkout.razorpay.com/v1/checkout.js";

function loadRazorpayScript(): Promise<boolean> {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const existing = document.querySelector(`script[src="${RAZORPAY_SCRIPT_SRC}"]`);
    if (existing) {
      existing.addEventListener("load", () => resolve(true));
      existing.addEventListener("error", () => resolve(false));
      return;
    }
    const script = document.createElement("script");
    script.src = RAZORPAY_SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function Plan() {
  const { session } = useAuth();
  const [billing, setBilling] = useState<BillingCycle>("monthly");
  const [selectedPlanId, setSelectedPlanId] = useState<number | null>(session?.planId ? Number(session.planId) : null);
  const [purchasingPlanId, setPurchasingPlanId] = useState<number | null>(null);

  const plansQuery = useEmployerPlans(billing === "yearly" ? "YEARLY" : "MONTHLY");
  const plans = plansQuery.data ?? [];
  const createOrder = useCreateEmployerPaymentOrder();
  const verifyPayment = useVerifyEmployerPayment();

  // CRITICAL: do not perform a real financial transaction / open the live
  // Razorpay widget during automated verification — this key is a real
  // production `rzp_live_*` key_id (Razorpay's own docs confirm key_id,
  // unlike key_secret, is meant for client-side use — not a secret, but
  // still a real production integration). Structurally implemented to
  // match pricing.component.ts exactly; only the read-only plan list was
  // live-verified.
  const handleBuyPlan = async (plan: EmployerPlan) => {
    if (!session) return;
    setPurchasingPlanId(plan.planId);
    try {
      const scriptReady = await loadRazorpayScript();
      if (!scriptReady || !window.Razorpay) {
        toast.error("Could not load the payment gateway. Check your connection and try again.");
        return;
      }

      // durationInDays is hardcoded to 30 in Angular regardless of the
      // selected billing cycle (pricing.component.ts's buyPlan()) —
      // preserved exactly, not derived from `billing` here.
      const order = await createOrder.mutateAsync({
        amount: plan.pricePerMonth,
        email: "",
        contact: session.mobileNumber ?? "",
        durationInDays: 30,
        userId: Number(session.parentId),
        planId: plan.planId,
      });

      const razorpay = new window.Razorpay({
        key: import.meta.env.VITE_RAZORPAY_KEY_ID as string,
        amount: order.amount * 100,
        name: "Kaam Saathi",
        order_id: order.orderId,
        prefill: { contact: session.mobileNumber ?? "" },
        theme: { color: "#2ba85b" },
        handler: (response) => {
          verifyPayment.mutate(
            {
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_signature: response.razorpay_signature,
            },
            {
              onSuccess: () => {
                // Angular's TokenService.setPlan() writes to a bugged empty
                // localStorage key and is never actually read back by
                // getPlanId() (which reads a different, login-time key) —
                // a confirmed source bug. Preserved by only updating local
                // page state here too, not inventing a working persistence
                // layer Angular itself doesn't have.
                setSelectedPlanId(plan.planId);
                toast.success("Plan activated successfully!");
              },
              onError: () => {
                toast.error("Payment verification failed. Please contact support if you were charged.");
              },
            },
          );
        },
      });
      razorpay.open();
    } catch {
      toast.error("Could not start checkout. Please try again.");
    } finally {
      setPurchasingPlanId(null);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="Employer" title="Pricing" trailing="Choose the perfect plan for your construction site management" />

      <div className="flex justify-center">
        <div className="inline-flex gap-1 rounded-lg bg-muted p-1">
          <Button size="sm" variant={billing === "monthly" ? "default" : "ghost"} onClick={() => setBilling("monthly")}>
            Monthly
          </Button>
          <Button size="sm" variant={billing === "yearly" ? "default" : "ghost"} onClick={() => setBilling("yearly")}>
            Yearly
          </Button>
        </div>
      </div>

      {plansQuery.isError ? (
        <ErrorState
          message={plansQuery.error instanceof ApiError ? plansQuery.error.message : "Could not load plans."}
          onRetry={() => plansQuery.refetch()}
        />
      ) : plansQuery.isLoading ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-80 w-full rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {plans.map((plan, i) => {
            const isCurrent = plan.planId === selectedPlanId;
            const isPopular = plan.planName === "Standard";
            const isPurchasing = purchasingPlanId === plan.planId;
            return (
              <GlowCard
                key={plan.planId}
                index={i}
                ambient={isPopular}
                bare
                className={`relative flex flex-col rounded-2xl border bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)] ${
                  isPopular ? "border-[#2ba85b] ring-1 ring-[#2ba85b]" : "border-[#eef0f3]"
                }`}
              >
                {isPopular && (
                  <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-[#2ba85b] px-3 py-1 text-xs font-semibold text-white">
                    ⭐ Most Popular
                  </span>
                )}
                <h3 className="text-lg font-bold text-foreground">{plan.planName}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.planName === "Starter" ? "Perfect for small teams" : "For growing teams"}
                </p>
                <div className="mt-4 flex items-baseline gap-1">
                  <span className="text-3xl font-bold text-foreground">₹{plan.pricePerMonth.toLocaleString()}</span>
                  <span className="text-sm text-muted-foreground">/{billing === "yearly" ? "year" : "month"}</span>
                </div>
                <ul className="mt-4 flex-1 space-y-2">
                  {plan.features?.map((feature, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                      <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2ba85b]" />
                      {feature.featureName}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" disabled={isCurrent || isPurchasing} onClick={() => handleBuyPlan(plan)}>
                  {isPurchasing && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {isCurrent ? "Current Plan" : "Get Started"}
                </Button>
              </GlowCard>
            );
          })}

          <div className="flex flex-col rounded-2xl border border-dashed border-[#eef0f3] bg-white p-6 shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
            <h3 className="text-lg font-bold text-foreground">Custom</h3>
            <p className="mt-1 text-sm text-muted-foreground">For larger organizations</p>
            <ul className="mt-4 flex-1 space-y-2 text-sm text-foreground">
              {["Unlimited workers", "All Professional features", "AI insights & analytics", "Custom integrations", "Dedicated support", "Custom pricing"].map(
                (item) => (
                  <li key={item} className="flex items-start gap-2">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#2ba85b]" />
                    {item}
                  </li>
                ),
              )}
            </ul>
            <Button variant="outline" className="mt-6 w-full" disabled title="Not implemented in the live Angular app (no click handler)">
              Contact Sales
            </Button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="text-2xl">⚡</div>
          <h4 className="mt-2 font-semibold text-foreground">Easy Setup</h4>
          <p className="mt-1 text-sm text-muted-foreground">Get started in minutes without technical hassle.</p>
        </div>
        <div className="rounded-2xl border border-[#eef0f3] bg-white p-5 text-center shadow-[0_2px_10px_rgba(0,0,0,0.04)]">
          <div className="text-2xl">🔓</div>
          <h4 className="mt-2 font-semibold text-foreground">Cancel Anytime</h4>
          <p className="mt-1 text-sm text-muted-foreground">No long-term contracts. Upgrade or cancel anytime.</p>
        </div>
      </div>
    </div>
  );
}
