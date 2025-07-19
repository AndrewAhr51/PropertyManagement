import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';

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

@Component({
  selector: 'app-payment-success',
  standalone: true,
  templateUrl: './payment-success.html',
  imports: [CommonModule],
  styleUrls: ['./payment-success.css']
})
export class PaymentSuccess implements OnInit {
  sessionId: string | null = null;
  invoiceId: string = '—';
  tenantId: string = '—';
  propertyId: string = '—';
  amount: number = 0;
  error: string | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private http: HttpClient
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
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

  private fetchSessionDetails(sessionId: string): void {
    this.http.get<any>(`/api/payments/session/${sessionId}`).subscribe({
      next: (session) => {
        console.log('[✅ Stripe session]', session);

        const metadata = session?.metadata ?? {};

        this.invoiceId = metadata.invoiceId ?? '—';
        this.tenantId = metadata.tenantId ?? '—';
        this.propertyId = metadata.propertyId ?? '—';
        this.amount = session?.amountTotal ? session.amountTotal / 100 : 0;
        this.sessionId = session?.id ?? sessionId;

        this.processPayment(session);
      },
      error: (err) => {
        this.error = '❌ Failed to retrieve session details.';
        console.error('❌ Failed to retrieve session:', err.status, err.message, err.error);
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

    const dto: CreatePaymentDto = {
      amount,
      paidOn: new Date().toISOString(),
      invoiceId: this.safeParseInt(metadata.invoiceId),
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

    if (!dto.amount || !dto.invoiceId || !dto.paymentMethod) {
      this.error = '❌ Missing required payment data.';
      console.warn('⚠️ Incomplete payment DTO:', dto);
      return;
    }

    console.log('[📦 Submitting CreatePaymentDto]', dto);

    this.http.post('/api/payments/process-payment', dto).subscribe({
      next: () => {
        console.log('💾 Payment processed successfully.');
      },
      error: (err) => {
        this.error = '❌ Failed to process payment.';
        console.error('❌ Payment processing error:', err.status, err.message, err.error);
      }
    });
  }

  private safeParseInt(value: any): number {
    const num = parseInt(value, 10);
    return isNaN(num) ? 0 : num;
  }
}
