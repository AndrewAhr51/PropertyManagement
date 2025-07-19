export interface CreateStripeDto {
  invoiceId: number;
  propertyId: number;
  tenantId?: number;
  ownerId?: number;
  paidOn: string; // ISO string for DateTime
  amount: number;
  currency: string; // default: "USD"
  paymentMethod: string; // default: "Card"
  metadata: Record<string, string>; // initialized to avoid nulls
}

export interface StripeResponseDto {
  clientSecret: string;
  status: string;
  amount: number;
  currency: string; // usually "usd"
  invoiceId: number;
  invoiceReference?: string;
}

export interface CheckoutUrlDto {
  checkoutUrl: string;
}
export interface StripeSessionDto {
  sessionId: string;
  amountTotal: number;
  currency: string;
  metadata: {
    invoiceId: string;
    tenantId: string;
    propertyId: string;
    ownerId: string;
  };
}

interface CreatePaymentDto {
  amount: number;
  paidOn: string;
  invoiceId: number;
  tenantId?: number | null;
  ownerId?: number | null;
  currency: string;
  paymentMethod: string;
  metadata: Record<string, string>;
}
