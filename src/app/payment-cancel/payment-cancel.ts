import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  imports: [CommonModule],
  selector: 'app-payment-cancel',
  templateUrl: './payment-cancel.html',
  styleUrls: ['./payment-cancel.css']
})
export class PaymentCancel implements OnInit {
  invoiceId = '';
  tenantId = '';
  propertyId = '';
  amount = 0;

  ngOnInit(): void {
    const cached = localStorage.getItem('lastInvoice');
    if (cached) {
      const data = JSON.parse(cached);
      this.invoiceId = data.invoiceId;
      this.tenantId = data.tenantId;
      this.propertyId = data.propertyId;
      this.amount = data.amount;
    }
  }

  retryPayment(): void {
    // Redirect or re-trigger the CreateCheckoutSession flow with cached values
  }
}
