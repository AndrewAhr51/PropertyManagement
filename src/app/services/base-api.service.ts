import { HttpClient, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, throwError } from 'rxjs';
import { catchError, retry, tap } from 'rxjs/operators';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class BaseApiService {
  constructor(private http: HttpClient) {}

  protected getHeaders(token: string): HttpHeaders {
    return new HttpHeaders({
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json'
    });
  }

  protected handleError(context: string) {
    return (err: HttpErrorResponse) => {
      console.error(`[❌ ${context}] API error:`, err);
      return throwError(() => err);
    };
  }

  public post<T>(url: string, body: any, token: string): Observable<T> {
    const headers = this.getHeaders(token);
    console.log(`[📡 POST] Request to: ${url}`);
    console.log('[📨 Body]:', body);
    console.log('[🛡️ Headers]:', headers);

    return this.http.post<T>(url, body, { headers }).pipe(
      tap((res) => {
        console.log(`[✅ POST Success] Response from ${url}:`, res);
      }),
      catchError(this.handleError(`POST ${url}`))
    );
  }

  public get<T>(url: string, token: string): Observable<T> {
    const headers = this.getHeaders(token);
    console.log(`[📡 GET] Request to: ${url}`);
    console.log('[🛡️ Headers]:', headers);

    return this.http.get<T>(url, { headers }).pipe(
      retry(2),
      tap((res) => {
        console.log(`[✅ GET Success] Response from ${url}:`, res);
      }),
      catchError(this.handleError(`GET ${url}`))
    );
  }
}
