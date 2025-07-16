import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StripeService } from '../services/stripe-service';
import { PayPalService } from '../services/paypal-service';
import { InvoiceService } from '../services/invoice-service';
import { SignalRService } from '../services/signalr-service';
import { InvoiceListByTenantDto, InvoiceDto } from '../models/invoice.model';
import { CreateStripeDto, StripeResponseDto } from '../models/stripe-model';
import { CreatePayPalDto, PayPalInitResponse, RawPayPalInitResponse, mapPayPalResponse } from '../models/paypal.model';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-stripe-payments',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './payments.html',
  styleUrl: './payments.css'
})
export class Payments implements OnInit {
  private stripeService = inject(StripeService);
  private paypalService = inject(PayPalService);
  private invoiceService = inject(InvoiceService);
  private signalRService = inject(SignalRService);
  private cdr = inject(ChangeDetectorRef);

  tenantId = 6;
  allInvoices: InvoiceDto[] = [];
  filteredInvoices: InvoiceDto[] = [];
  pagedInvoices: InvoiceDto[] = [];

  filterStatus: string = 'All';
  searchQuery: string = '';
  sortKey: keyof InvoiceDto = 'dueDate';
  sortAsc: boolean = true;

  pageSize = 10;
  currentPage = 0;
  totalPages = 0;

  approvalLink: string | null = null;


  ngOnInit(): void {
    this.filterStatus = 'All';
    this.searchQuery = '';
    this.sortKey = 'dueDate';
    this.sortAsc = true;
    this.currentPage = 0;

    this.signalRService.startConnection();
    this.signalRService.listenForInvoiceStatus((invoiceId: number) => {
      console.log('[📡 Real-time update received]', invoiceId);
      this.refreshInvoice(invoiceId);
    });

    this.invoiceService.getAllInvoicesByTenantId(this.tenantId).subscribe({
      next: (resArray: unknown) => {
        if (Array.isArray(resArray)) {
          const firstTenant = resArray[0] as InvoiceListByTenantDto;
          this.allInvoices = Array.isArray(firstTenant?.invoices)
            ? firstTenant.invoices
            : [];
        } else {
          this.allInvoices = [];
        }

        setTimeout(() => {
          this.applyFiltersAndSort();
          this.cdr.detectChanges();
        }, 0);
      },
      error: (err) => {
        console.error('[❌ API error]', err);
        this.allInvoices = [];
        this.filteredInvoices = [];
        this.pagedInvoices = [];
        this.totalPages = 0;
      }
    });
  }

  applyFiltersAndSort(): void {
    const keyword = (this.searchQuery ?? '').trim().toLowerCase();
    const normalizedStatus = (this.filterStatus ?? 'all').trim().toLowerCase();

    this.filteredInvoices = this.allInvoices.filter((inv) => {
      const matchesStatus =
        normalizedStatus === 'all' ? true :
        normalizedStatus === 'paid' ? inv.isPaid :
        normalizedStatus === 'unpaid' ? !inv.isPaid :
        false;

      const matchesSearch =
        keyword === '' ? true :
        (
          inv.propertyName?.toLowerCase().includes(keyword) ||
          inv.tenantName?.toLowerCase().includes(keyword) ||
          inv.status?.toLowerCase().includes(keyword)
        );

      return matchesStatus && matchesSearch;
    });

    this.filteredInvoices.sort((a, b) => {
      const valA = a[this.sortKey] ?? '';
      const valB = b[this.sortKey] ?? '';
      if (valA < valB) return this.sortAsc ? -1 : 1;
      if (valA > valB) return this.sortAsc ? 1 : -1;
      return 0;
    });

    this.totalPages = Math.ceil(this.filteredInvoices.length / this.pageSize);
    this.updatePagedInvoices();
    this.cdr.detectChanges();
  }

  updatePagedInvoices(): void {
    const start = this.currentPage * this.pageSize;
    const end = start + this.pageSize;
    this.pagedInvoices = this.filteredInvoices.slice(start, end);
    this.cdr.detectChanges();
  }

  changePage(page: number): void {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.updatePagedInvoices();
    }
  }

  setFilter(status: string): void {
    this.filterStatus = status.trim();
    this.currentPage = 0;
    this.applyFiltersAndSort();
  }

  toggleSort(key: keyof InvoiceDto): void {
    this.sortKey = key;
    this.sortAsc = !this.sortAsc;
    this.applyFiltersAndSort();
  }

  onFilterChange(event: Event): void {
    const value = (event.target as HTMLSelectElement)?.value || 'All';
    this.setFilter(value);
  }

  viewInvoiceDetails(invoice: InvoiceDto): void {
    console.log('🔍 View invoice details:', invoice);
  }

  createCheckoutSession(invoice: InvoiceDto): void {
    const dto: CreateStripeDto = {
      invoiceId: invoice.invoiceId,
      propertyId: invoice.propertyId,
      tenantId: invoice.tenantId,
      ownerId: invoice.ownerId,
      paidOn: new Date().toISOString(),
      amount: invoice.amount - invoice.amountPaid,
      currency: 'USD',
      paymentMethod: 'Card',
      metadata: {
        invoiceId: invoice.invoiceId.toString(),
        tenant: invoice.tenantName ?? '',
        property: invoice.propertyName ?? '',
        owner: invoice.ownerName ?? ''
      }
    };


    this.stripeService.CreateCheckoutSession(dto).subscribe({
      next: (response) => {
        if (response?.checkoutUrl) {
          window.location.href = response.checkoutUrl; // 🔀 Full-page redirect
        } else {
           console.error('❌ Stripe did not return a valid payment URL.');
        }
      },
      error: (err) => {
         console.error('❌ Stripe error:', err);
  }
});

  }

  refreshInvoice(invoiceId: number): void {
    this.invoiceService.getInvoiceById(invoiceId).subscribe({
      next: (updated: InvoiceDto) => {
        const index = this.allInvoices.findIndex(inv => inv.invoiceId === invoiceId);
        if (index >= 0) {
          this.allInvoices[index] = updated;
          console.log('[🔁 Invoice updated]', updated);
          this.applyFiltersAndSort();
        } else {
          console.warn('[⚠️ Invoice not found]', invoiceId);
        }
      },
      error: (err) => {
        console.error('[❌ Failed to refresh invoice]', err);
      }
    });
  }

  initializePayPal(invoice: InvoiceDto): void {
    const dto: CreatePayPalDto = {
      invoiceId: invoice.invoiceId,
      tenantId: invoice.tenantId,
      ownerId: invoice.ownerId,
      orderId: '', // Will be populated after order creation
      amount: invoice.amount - invoice.amountPaid,
      currency: 'USD',
      paymentDate: new Date(),
      note: 'Payment via PayPal',
      metadata: {
        invoiceId: invoice.invoiceId.toString(),
        tenant: invoice.tenantName ?? '',
        property: invoice.propertyName ?? '',
        owner: invoice.ownerName ?? ''
      }
    };

    this.paypalService.launchPayPal(dto).subscribe({
      next: (res: PayPalInitResponse) => {
        const mappedResponse = mapPayPalResponse(res);
        this.approvalLink = mappedResponse.approvalLink;
        console.log('[✅ PayPal session created]', mappedResponse);
      },
      error: (err) => {
        console.error('[❌ PayPal session failed]', err);
      }
    });
  }
  // Placeholder for Plaid integration
  /*  createPlaidSession(invoice: InvoiceDto): void {
    // Implementation for Plaid session creation
  } */
  processSelectedPayment(invoice: InvoiceDto, event: Event): void {
    const selectedPayment = (event.target as HTMLSelectElement).value;

  if (!selectedPayment || invoice.isPaid) return;

  switch (selectedPayment) {
    case 'stripe':
      this.createCheckoutSession(invoice);
      break;
    case 'paypal':
      this.initializePayPal(invoice);
      break;
    case 'plaid':
      //this.createPlaidSession(invoice);
      break;
    default:
      console.warn('Unrecognized payment method:', selectedPayment);
  }

}

}
