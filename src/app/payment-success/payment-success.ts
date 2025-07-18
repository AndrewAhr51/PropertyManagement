import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-payment-success',
  templateUrl: './payment-success.html',
  styleUrls: ['./payment-success.css']
})
export class PaymentSuccess implements OnInit {
  sessionId: string | null = null;
  invoiceId: string = '';
  tenantId: string = '';
  propertyId: string = '';
  amount: number = 0;

  constructor(private route: ActivatedRoute, private http: HttpClient) {}

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.queryParamMap.get('session_id');

    if (this.sessionId) {
      this.http.get<any>(`/api/payments/session/${this.sessionId}`).subscribe({
        next: (session) => {
          const metadata = session.metadata;
          this.invoiceId = metadata.invoiceId;
          this.tenantId = metadata.tenantId;
          this.propertyId = metadata.propertyId;
          this.amount = session.amount_total / 100;
        },
        error: (err) => {
          console.error('❌ Failed to retrieve session:', err);
        }
      });
    } else {
      console.warn('⚠️ No session_id found in query params.');
    }
  }
}
