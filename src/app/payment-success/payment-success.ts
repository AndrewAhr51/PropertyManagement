import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { ChangeDetectorRef } from '@angular/core';

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

export interface ReceiptDto {
  amount: number;
  currency: string;
  invoiceId: string;
  paymentMethod: string;
  paidOn: Date;
  receiptUrl?: string;
  cardBrand?: string;
  cardLast4?: string;
  cardExpMonth?: number;
  cardExpYear?: number;
  chargeId?: string;
  chargeStatus?: string;
  metadata: {
    stripeName?: string;
    stripeEmail?: string;
    stripeSessionId?: string;
    address?: {
      line1?: string;
      line2?: string;
      city?: string;
      state?: string;
      postal_code?: string;
      country?: string;
    };
  };
}

export interface WebhookEventRecord {
  eventId: string;
  sessionId: string;
  eventType: string;
  outcome: string;
  receivedAt: string;
  errorDetails?: string;
}

@Component({
  selector: 'app-payment-success',
  standalone: true,
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.css'],
  imports: [CommonModule]
})
export class PaymentSuccess implements OnInit, OnDestroy {
  sessionId: string | null = null;
  invoiceId: string = '—';
  tenantId: string = '—';
  tenantName: string = '—';
  propertyId: string = '—';
  propertyName: string = '—';
  amount: number = 0;

  webhookEvents: WebhookEventRecord[] = [];
  dto: ReceiptDto | null = null;
  isLoaded: boolean = false;
  error: string | null = null;
  private hasFetched = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      if (this.hasFetched) return;
      this.hasFetched = true;

      const incomingSessionId = params['session_id'];
      this.sessionId = incomingSessionId || localStorage.getItem('stripeSessionId');
      console.log('[🔍 Loaded session ID]', this.sessionId);

      if (!this.sessionId) {
        this.error = 'Missing session ID in query params or local storage.';
        return;
      }

      localStorage.setItem('stripeSessionId', this.sessionId);
      this.fetchSessionDetails(this.sessionId);
    });
  }

  ngOnDestroy(): void {
    localStorage.removeItem('stripeSessionId');
  }

  private fetchSessionDetails(sessionId: string): void {
    this.http.get<any>(`/api/payments/session/${sessionId}`).subscribe({
      next: session => {
        console.log('[✅ Stripe session]', session);

        const paymentIntent = session.payment_intent;
        const receiptUrl = paymentIntent?.charges?.data[0]?.receipt_url ?? '';
        const cardDetails = paymentIntent?.charges?.data[0]?.payment_method_details?.card ?? {};
        const cardBrand = cardDetails.brand ?? '';
        const cardLast4 = cardDetails.last4 ?? '';
        const metadata = session?.metadata ?? {};
        const charge = paymentIntent?.charges?.data[0];
        const card = charge?.payment_method_details?.card ?? {};
        const address = session?.customer_details?.address ?? {};


        this.invoiceId = this.resolveField(metadata.invoiceId);
        this.tenantId = this.resolveField(metadata.tenantId);
        this.tenantName = this.resolveField(metadata.tenantName);
        this.propertyId = this.resolveField(metadata.propertyId);
        this.propertyName = this.resolveField(metadata.propertyName);
        this.amount = session?.amountTotal ? session.amountTotal / 100 : 0;
        this.sessionId = session?.id ?? sessionId;
        this.isLoaded = true;
       setTimeout(() => {
            this.dto = {
              amount: this.amount,
              currency: session?.currency?.toUpperCase() ?? 'USD',
              invoiceId: this.invoiceId,
              paymentMethod: 'card',
              paidOn: new Date(),
              receiptUrl: charge?.receipt_url ?? '',
              cardBrand: card.brand ?? '',
              cardLast4: card.last4 ?? '',
              cardExpMonth: card.exp_month,
              cardExpYear: card.exp_year,
              chargeId: charge?.id,
              chargeStatus: charge?.status,
              metadata: {
                stripeName: this.tenantName,
                stripeEmail: session.customer_details?.email ?? '',
                stripeSessionId: session.id,
                address
              }
            };// assign full DTO here
          this.cdr.detectChanges();
        }, 0);

        this.processPayment(session);
        this.loadWebhookDiagnostics();
      },
      error: err => {
        this.error = '❌ Failed to retrieve session details.';
        console.error('❌ Session fetch error:', err.status, err.message, err.error);
      }
    });
  }

  private processPayment(session: any): void {
    const metadata = session?.metadata ?? {};
    const amountCents = session?.amountTotal;
    const amount = amountCents != null ? amountCents / 100 : null;

    if (!amount || amount <= 0) {
      this.error = '❌ Invalid payment amount received from Stripe.';
      console.warn('[⚠️ Stripe amountTotal is missing or zero]', session);
      return;
    }

    const invoiceId = this.safeParseInt(metadata.invoiceId);
    if (!invoiceId) {
      this.error = '❌ Invalid invoice ID.';
      console.warn('⚠️ Invoice ID is missing or invalid');
      return;
    }

    const dto: CreatePaymentDto = {
      amount,
      paidOn: new Date().toISOString(),
      invoiceId,
      tenantId: this.safeParseInt(metadata.tenantId) || null,
      ownerId: this.safeParseInt(metadata.ownerId) || null,
      currency: session?.currency?.toUpperCase() ?? 'USD',
      paymentMethod: 'Card',
      metadata: {
        stripeSessionId: session?.id ?? '',
        stripePaymentIntent: session?.payment_intent ?? '',
        stripeCustomerId: session?.customer ?? '',
        stripeEmail: session?.customer_details?.email ?? '',
        stripeName: session?.customer_details?.name ?? ''
      }
    };

    console.log('[📦 Submitting CreatePaymentDto]', dto);

    this.http.post('/api/payments/process-payment', dto).subscribe({
      next: () => {
        console.log('💾 Payment processed successfully.');
      },
      error: err => {
        this.error = '❌ Failed to process payment.';
        console.error('❌ Payment processing error:', err.status, err.message, err.error);
      }
    });
  }

  private loadWebhookDiagnostics(): void {
    if (!this.sessionId) return;

    this.http.get<WebhookEventRecord[]>(`/api/webhooks/diagnostics/${this.sessionId}`).subscribe({
      next: events => {
        console.log('[📡 Webhook Events]', events);
        this.webhookEvents = events;
      },
      error: err => {
        this.error = '⚠️ Unable to retrieve webhook events.';
        console.warn('❌ Webhook diagnostics fetch failed', err);
      }
    });
  }

  private safeParseInt(value: any): number {
    const num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
  }

  private resolveField(value: any): string {
    const str = typeof value === 'string' ? value.trim() : String(value);
    return !str || str.toLowerCase() === 'null' || str.toLowerCase() === 'undefined' ? '—' : str;
  }

  logClick(): void {
    console.log('[🔁 Payments button clicked]');
    this.router.navigate(['/payments']);
  }

  getOutcomeClass(outcome: string): string {
    return outcome.toLowerCase();
  }
}
