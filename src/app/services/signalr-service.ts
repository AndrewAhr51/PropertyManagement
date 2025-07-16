import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';

@Injectable({ providedIn: 'root' })
export class SignalRService {
  private hubConnection: signalR.HubConnection | null = null;

  startConnection(): void {
    if (this.hubConnection) return; // Already connected

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl('https://localhost:7144/paymentsHub') // ✅ Match your backend route
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Information)
      .build();

    this.hubConnection
      .start()
      .then(() => console.log('[🛰 SignalR Connected to /paymentsHub]'))
      .catch(err => console.error('[❌ SignalR Connection Failed]', err));
  }

  listenForInvoiceStatus(callback: (invoiceId: number) => void): void {
    if (!this.hubConnection) {
      console.warn('[🚫 SignalR] Connection not initialized.');
      return;
    }

    this.hubConnection.on('InvoiceStatusUpdated', (invoiceId: number) => {
      console.log('[📬 Received InvoiceStatusUpdated]', invoiceId);
      callback(invoiceId);
    });
  }

  stopConnection(): void {
    this.hubConnection?.stop().then(() => {
      console.log('[🛑 SignalR Disconnected]');
      this.hubConnection = null;
    });
  }
  public sendInvoiceStatusUpdated(invoiceId: number): void {
  if (this.hubConnection) {
    this.hubConnection.invoke('BroadcastInvoiceUpdate', invoiceId)
      .catch(err => console.error('[❌ SignalR Send Failed]', err));
  }
}
}
