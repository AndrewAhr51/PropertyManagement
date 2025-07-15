export interface InvoiceLineItemMetadataDto {
  metaKey: string;
  metaValue: string;
}

export interface InvoiceLineItemDto {
  lineItemId: number;
  invoiceId: number;
  lineItemTypeId: number;
  description: string;
  amount: number;
  metadata: InvoiceLineItemMetadataDto[];
}

export interface InvoiceDto {
  invoiceId: number;
  propertyId: number;
  tenantId: number;
  tenantName?: string;
  email: string;

  lineItemId: number;

  propertyName?: string;
  ownerName?: string;
  ownerId?: number;

  referenceNumber: string;
  amount: number;
  amountPaid: number;
  balanceDue: number;

  dueDate: string;
  lastMonthDue: number;
  lastMonthPaid: number;
  rentMonth: number;
  rentYear: number;
  isPaid: boolean;
  status: string;
  notes?: string;

  createdBy: string;
  createdDate: string;
  modifiedDate: string;

  lineItems: InvoiceLineItemDto[];
}

export interface InvoiceListByTenantDto {
  tenantId: number;
  tenantName: string;
  invoices: InvoiceDto[];
  totalInvoices: number;
}
