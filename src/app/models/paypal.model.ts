export interface CreatePayPalDto {
  invoiceId: number;
  tenantId?: number | null;
  ownerId?: number | null;
  orderId: string;            // Populated after order creation
  amount: number;
  currency: string;
  paymentDate: Date;
  note: string;
  metadata: { [key: string]: string };
}

// Optional helper for default initialization
export const createPayPalDto = (): CreatePayPalDto => ({
  invoiceId: 0,
  tenantId: null,
  ownerId: null,
  orderId: '',
  amount: 0.0,
  currency: 'USD',
  paymentDate: new Date(),
  note: 'Payment via PayPal',
  metadata: {}
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
