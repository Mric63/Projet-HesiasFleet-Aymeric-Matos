import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { AppNotification } from '../models';

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private http = inject(HttpClient);

  // Partagé entre le badge de la toolbar et le dashboard
  private readonly _notifications = signal<AppNotification[]>([]);
  readonly notifications = this._notifications.asReadonly();

  refresh(): void {
    this.http
      .get<AppNotification[]>(`${environment.apiUrl}/notifications`)
      .subscribe({
        next: list => this._notifications.set(list),
        error: () => this._notifications.set([])
      });
  }
}
