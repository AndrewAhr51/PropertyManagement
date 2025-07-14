export interface PayPalDto {
  InvoiceId: number;
  TenantId?: number | null;
  OwnerId?: number | null;
  OrderId: string;            // Populated after order creation
  Amount: number;
  CurrencyCode: string;
  PaymentDate: Date;
  Note: string;
  Metadata: { [key: string]: string };
}

// Optional helper for default initialization
export const createPayPalDto = (): PayPalDto => ({
  InvoiceId: 0,
  TenantId: null,
  OwnerId: null,
  OrderId: '',
  Amount: 0.0,
  CurrencyCode: 'USD',
  PaymentDate: new Date(),
  Note: 'Payment via PayPal',
  Metadata: {}
});

export interface RawPayPalInitResponse {
  orderId: string;
  approvalLink: string;
  status: string;
  amount: number;
  currencyCode: string;
  invoiceId?: number;
  invoiceReference?: string;
}

// Optional camelCase version for frontend use
export interface PayPalInitResponse {
  orderId: string;
  approvalLink: string;
  status: string;
  amount: number;
  currencyCode: string;
  invoiceId?: number;
  invoiceReference?: string;
}

export const mapPayPalResponse = (raw: RawPayPalInitResponse): PayPalInitResponse => ({
  orderId: raw.orderId,
  approvalLink: raw.approvalLink,
  status: raw.status,
  amount: raw.amount,
  currencyCode: raw.currencyCode,
  invoiceId: raw.invoiceId,
  invoiceReference: raw.invoiceReference
});
