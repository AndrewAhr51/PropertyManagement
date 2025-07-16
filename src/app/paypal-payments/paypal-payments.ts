import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PayPalService } from '../services/paypal-service';
import { CreatePayPalDto, PayPalInitResponse } from '../models/paypal.model'; // ✅ Only import what’s needed

@Component({
  selector: 'app-paypal-payments',
  templateUrl: './paypal-payments.html',
  styleUrls: ['./paypal-payments.css'],
  standalone: true,
  imports: [CommonModule, FormsModule]
})
export class PayPalPayments implements OnInit {
    checkoutEnabled = false;
    latestApprovalLink: string | null = null;
    invoice: CreatePayPalDto = {
    invoiceId: 0,
    tenantId: 0,
    ownerId: 0,
    orderId: '',
    amount: 0.0,
    currency: 'USD',
    paymentDate: new Date(),
    note: 'Payment via PayPal',
    metadata: {
      CardType: 'Visa',
      Last4Digits: '8084'
    }
  };

  constructor(private paypalService: PayPalService) {}

  ngOnInit(): void {
    console.log('PayPalPayments component initialized');
  }

  get formattedPaymentDate(): string {
    return this.invoice.paymentDate.toISOString().split('T')[0];
  }

  updatePaymentDate(dateString: string): void {
    const parsedDate = new Date(dateString);
    if (isNaN(parsedDate.getTime())) {
      console.warn('Invalid date string received from input:', dateString);
      return;
    }
    parsedDate.setHours(0, 0, 0, 0);
    this.invoice.paymentDate = parsedDate;
    console.log('Updated PaymentDate:', this.invoice.paymentDate);
  }


  onSubmit(): void {
    console.log('Submitting PayPal order:', this.invoice);

    this.paypalService.launchPayPal(this.invoice).subscribe(
      (res: PayPalInitResponse) => {
        this.invoice.orderId = res.orderId;
        this.latestApprovalLink = res.approvalLink;

        if (this.latestApprovalLink) {
          this.checkoutEnabled = true;
        } else {
          console.warn('Approval link not found.');
          this.checkoutEnabled = false;
        }

        console.log('Mapped PayPal response:', res);
      },
      (err) => {
        console.error('PayPal initialization failed:', err);
        this.checkoutEnabled = false;
      }
    );
  }

  launchApprovalLink(): void {
    if (this.latestApprovalLink) {
      console.log('[🧭 Launching PayPal checkout]', this.latestApprovalLink);
      window.open(this.latestApprovalLink, '_blank');
    } else {
      console.warn('Approval link is not set.');
    }
  }

}
