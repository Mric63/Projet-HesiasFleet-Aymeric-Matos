import { Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { VehicleService } from '../../core/services/vehicle.service';
import { PartService } from '../../core/services/part.service';
import { NotificationService } from '../../core/services/notification.service';
import { StockStatus, Vehicle } from '../../core/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, RouterLink,
    MatCardModule, MatIconModule, MatTableModule, MatChipsModule, MatButtonModule
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Tableau de bord</h1>
      </div>

      <div class="kpis">
        <div class="kpi">
          <div class="kpi-icon"><mat-icon>directions_car</mat-icon></div>
          <div class="kpi-value">{{ vehicles().length }}</div>
          <div class="kpi-label">Véhicules</div>
        </div>

        <div class="kpi" [class.alert]="dueDeadlines().length > 0">
          <div class="kpi-icon"><mat-icon>event_busy</mat-icon></div>
          <div class="kpi-value">{{ dueDeadlines().length }}</div>
          <div class="kpi-label">Butées atteintes</div>
        </div>

        <div class="kpi" [class.alert]="lowStock().length > 0">
          <div class="kpi-icon"><mat-icon>warning</mat-icon></div>
          <div class="kpi-value">{{ lowStock().length }}</div>
          <div class="kpi-label">Alertes de stock</div>
        </div>
      </div>

      <mat-card class="section">
        <mat-card-header>
          <mat-card-title>Opérations à effectuer</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (dueDeadlines().length === 0) {
            <p class="empty-state">Aucune butée atteinte. Toute la flotte est à jour.</p>
          } @else {
            <table mat-table [dataSource]="dueDeadlines()">
              <ng-container matColumnDef="vehicle">
                <th mat-header-cell *matHeaderCellDef>Véhicule</th>
                <td mat-cell *matCellDef="let n">
                  <a [routerLink]="['/vehicles', n.vehicleId]">{{ n.vehicleLabel }}</a>
                </td>
              </ng-container>

              <ng-container matColumnDef="operation">
                <th mat-header-cell *matHeaderCellDef>Opération</th>
                <td mat-cell *matCellDef="let n">{{ n.operationLabel }}</td>
              </ng-container>

              <ng-container matColumnDef="date">
                <th mat-header-cell *matHeaderCellDef>Échéance calendaire</th>
                <td mat-cell *matCellDef="let n">
                  @if (n.deadlineDate) {
                    <div>{{ n.deadlineDate | date:'dd/MM/yyyy' }}</div>
                    <small [class.overdue]="n.daysRemaining < 0">
                      {{ relativeDays(n.daysRemaining) }}
                    </small>
                  } @else { — }
                </td>
              </ng-container>

              <ng-container matColumnDef="mileage">
                <th mat-header-cell *matHeaderCellDef>Échéance kilométrique</th>
                <td mat-cell *matCellDef="let n">
                  @if (n.deadlineMileage != null) {
                    <div>{{ n.deadlineMileage | number }} km</div>
                    <small [class.overdue]="n.kilometersRemaining < 0">
                      {{ relativeKm(n.kilometersRemaining) }}
                    </small>
                  } @else { — }
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="deadlineColumns"></tr>
              <tr mat-row *matRowDef="let row; columns: deadlineColumns"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>

      <mat-card class="section">
        <mat-card-header>
          <mat-card-title>Alertes de stock</mat-card-title>
        </mat-card-header>
        <mat-card-content>
          @if (lowStock().length === 0) {
            <p class="empty-state">Aucune pièce sous son seuil minimum.</p>
          } @else {
            <div class="chips">
              @for (s of lowStock(); track s.partId) {
                <mat-chip highlighted color="warn">
                  {{ s.category }} — {{ s.brand }} {{ s.reference }}
                  : {{ s.availableQuantity }} / {{ s.minimum }}
                </mat-chip>
              }
            </div>
            <a mat-button routerLink="/parts">Ouvrir le magasin</a>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .kpis { display: flex; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; }

    /* Bloc KPI : carte nette, gros chiffre condensé, liseré ambre en haut */
    .kpi {
      flex: 1 1 200px;
      background: var(--mat-sys-surface-container);
      border: 1px solid var(--mat-sys-outline);
      border-top: 4px solid var(--hf-amber);
      border-radius: 10px;
      padding: 24px 26px;
      position: relative;
    }
    .kpi-icon { position: absolute; top: 22px; right: 22px; }
    .kpi-icon mat-icon {
      font-size: 30px; width: 30px; height: 30px;
      color: var(--hf-muted); opacity: 0.5;
    }
    .kpi-value {
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800; font-size: 52px; line-height: 1;
      color: var(--hf-ink);
    }
    .kpi-label {
      font-size: 13px; color: var(--hf-muted);
      text-transform: uppercase; letter-spacing: 0.08em;
      margin-top: 6px; font-weight: 600;
    }

    /* Variante alerte : liseré + chiffre + icône en rouge */
    .kpi.alert { border-top-color: var(--mat-sys-error); }
    .kpi.alert .kpi-value { color: var(--mat-sys-error); }
    .kpi.alert .kpi-icon mat-icon { color: var(--mat-sys-error); opacity: 1; }

    .section { margin-bottom: 24px; }
    .overdue { color: var(--mat-sys-error); font-weight: 600; }
    .chips { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 12px; }
  `]
})
export class DashboardPage implements OnInit {
  private vehicleService = inject(VehicleService);
  private partService = inject(PartService);
  private notificationService = inject(NotificationService);

  vehicles = signal<Vehicle[]>([]);
  stock = signal<StockStatus[]>([]);
  dueDeadlines = this.notificationService.notifications;

  deadlineColumns = ['vehicle', 'operation', 'date', 'mileage'];

  ngOnInit(): void {
    this.notificationService.refresh();
    this.vehicleService.getAll().subscribe(v => this.vehicles.set(v));
    this.partService.getStockOverview().subscribe(s => this.stock.set(s));
  }

  lowStock() {
    return this.stock().filter(s => s.isBelowMinimum);
  }

  relativeDays(days: number | null | undefined): string {
    if (days == null) return '';
    if (days < 0) return `en retard de ${Math.abs(days)} j`;
    if (days === 0) return "aujourd'hui";
    return `dans ${days} j`;
  }

  relativeKm(km: number | null | undefined): string {
    if (km == null) return '';
    if (km < 0) return `dépassé de ${Math.abs(km).toLocaleString('fr-FR')} km`;
    return `dans ${km.toLocaleString('fr-FR')} km`;
  }
}
