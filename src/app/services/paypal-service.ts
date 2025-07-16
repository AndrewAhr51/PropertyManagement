import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators'; // ✅ Correct import for map operator
import { BaseApiService } from './base-api.service';
import { CreatePayPalDto, PayPalInitResponse, RawPayPalInitResponse, mapPayPalResponse } from '../models/paypal.model';
import { environment } from '../../environments/environment';
import { Inject } from '@angular/core';
import { tap } from 'rxjs/operators'; // ✅ Supposed to fix it

export interface PayPalLink {
  rel: string;
  href: string;
}

@Injectable({ providedIn: 'root' })
export class PayPalService {
  private readonly baseUrl = `${environment.apiBaseUrl}`;
  private readonly token = environment.paypalToken;

  constructor(private api: BaseApiService) {}

  launchPayPal(dto: CreatePayPalDto): Observable<PayPalInitResponse> {
    console.log('[PayPalService] Sending DTO to backend:', dto);
    const url = `${this.baseUrl}/initialize`;

    return this.api
      .post<RawPayPalInitResponse>(url, dto, this.token)
      .pipe(
          tap((raw) => {
            console.log('[🔍 Real API Response]', raw);
          }),
          map((raw) => {
            const mapped = mapPayPalResponse(raw);
            console.log('[✅ Mapped Response]', mapped);
            return mapped;
          })
    )
  }

  getApprovalLinkOrder(orderId: string): Observable<any> {
    const url = `${this.baseUrl}/approval-link/${orderId}`;
    return this.api.post<any>(url, {}, this.token);
  }
}
