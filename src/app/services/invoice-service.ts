import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { InvoiceDto, InvoiceListByTenantDto } from '../models/invoice.model'; // Make sure this path matches your project

@Injectable({
  providedIn: 'root'
})
export class InvoiceService {
    private readonly baseUrl = 'https://localhost:7144/api/invoices'; /// Replace with your actual base URL

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
      // Add Authorization here if needed
    });
  }

  /**
   * Fetches an invoice by ID
   */
  getInvoiceById(id: number): Observable<InvoiceDto> {
    const url = `${this.baseUrl}/get-invoice-by-invoiceid/${id}`;
    console.log('[🔍 Invoice API URL]', url);
    return this.http.get<InvoiceDto>(url, {
      headers: this.getHeaders()
    });
  }

 getAllInvoicesByTenantId(id: number): Observable<InvoiceListByTenantDto[]> {
  const url = `${this.baseUrl}/get-all-invoices-by-tenantid/${id}`;
  console.log('[🔗 Fetching invoices for tenant]', id);

  return this.http.get<InvoiceListByTenantDto[]>(url, {
    headers: this.getHeaders()
  });
}
}


