import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CreateStripeDto, StripeResponseDto, CheckoutUrlDto } from '../models/stripe-model'; // Adjust path as needed

@Injectable({ providedIn: 'root' })
export class StripeService {
  private readonly stripeBaseUrl = 'https://localhost:7144/api/payments/stripe'; // Update to match your backend

  constructor(private http: HttpClient) {}

  private getHeaders(): HttpHeaders {
    return new HttpHeaders({
      'Content-Type': 'application/json'
      // Add Authorization header if needed
    });
  }

  CreateCheckoutSession(dto: CreateStripeDto): Observable<CheckoutUrlDto> {
    const url = `${this.stripeBaseUrl}/create-checkout-session`;
    return this.http.post<CheckoutUrlDto>(url, dto, {
      headers: this.getHeaders()
    });
  }
  /**
   * Initializes a Stripe payment session
   */
  processPayment(dto: CreateStripeDto): Observable<StripeResponseDto> {
    const url = `${this.stripeBaseUrl}/stripe-payment`;
    return this.http.post<StripeResponseDto>(url, dto, {
      headers: this.getHeaders()
    });
  }
}
