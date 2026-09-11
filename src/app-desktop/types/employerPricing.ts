// Verified against pricing.component.ts and pricing-service.ts.
export interface PlanFeature {
  featureName: string;
}

export interface EmployerPlan {
  planId: number;
  planName: string;
  pricePerMonth: number;
  features: PlanFeature[];
}

export interface CreateOrderPayload {
  amount: number;
  email: string;
  contact: string;
  durationInDays: number;
  userId: number;
  planId: number;
}

export interface CreateOrderResponse {
  orderId: string;
  amount: number;
}

export interface VerifyPaymentPayload {
  razorpay_payment_id: string;
  razorpay_order_id: string;
  razorpay_signature: string;
}
