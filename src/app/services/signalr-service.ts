import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;

  startConnection(): void {
    if (this.hubConnection) {
      return; // already connected
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://your-api-url/notification-hub') // 🔗 replace with actual endpoint
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('[🛰 SignalR Connected]'))
      .catch(err => console.error('[❌ SignalR Failed]', err));
  }

  addInvoiceListener(callback: (invoiceId: number) => void): void {
    if (!this.hubConnection) return;

    this.hubConnection.on('InvoiceStatusUpdated', (invoiceId: number) => {
      console.log('[📬 Received InvoiceStatusUpdated]', invoiceId);
      callback(invoiceId);
    });
  }

  stopConnection(): void {
    this.hubConnection?.stop();
  }
}
