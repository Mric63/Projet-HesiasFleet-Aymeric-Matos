import { Component, OnInit, inject, signal } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { VehicleService } from '../../core/services/vehicle.service';
import { Vehicle } from '../../core/models';
import { VehicleFormDialog } from './vehicle-form.dialog';

@Component({
  selector: 'app-vehicle-list',
  standalone: true,
  imports: [
    DecimalPipe, MatCardModule, MatTableModule, MatButtonModule, MatIconModule,
    MatDialogModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Véhicules</h1>
        <button mat-flat-button color="primary" (click)="openCreate()">
          <mat-icon>add</mat-icon> Nouveau véhicule
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          <mat-form-field class="full-width">
            <mat-label>Rechercher</mat-label>
            <input matInput (input)="onFilter($event)"
                   placeholder="Immatriculation, marque, modèle…">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          @if (filtered().length === 0) {
            <p class="empty-state">Aucun véhicule enregistré.</p>
          } @else {
            <table mat-table [dataSource]="filtered()">
              <ng-container matColumnDef="identifier">
                <th mat-header-cell *matHeaderCellDef>Identification</th>
                <td mat-cell *matCellDef="let v">
                  {{ v.registrationNew || v.registrationOld || v.customIdentifier || '—' }}
                </td>
              </ng-container>

              <ng-container matColumnDef="brand">
                <th mat-header-cell *matHeaderCellDef>Marque</th>
                <td mat-cell *matCellDef="let v">{{ v.brand }}</td>
              </ng-container>

              <ng-container matColumnDef="model">
                <th mat-header-cell *matHeaderCellDef>Modèle</th>
                <td mat-cell *matCellDef="let v">{{ v.model }}</td>
              </ng-container>

              <ng-container matColumnDef="mileage">
                <th mat-header-cell *matHeaderCellDef>Kilométrage</th>
                <td mat-cell *matCellDef="let v">{{ v.mileage | number }} km</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let v" (click)="$event.stopPropagation()">
                  <button mat-icon-button (click)="edit(v)" aria-label="Modifier">
                    <mat-icon>edit</mat-icon>
                  </button>
                  <button mat-icon-button color="warn" (click)="remove(v)"
                          aria-label="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"
                  class="clickable" (click)="open(row)"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .clickable { cursor: pointer; }
    .clickable:hover { background: var(--mat-sys-surface-container); }
  `]
})
export class VehicleListPage implements OnInit {
  private service = inject(VehicleService);
  private dialog = inject(MatDialog);
  private router = inject(Router);
  private snackbar = inject(MatSnackBar);

  vehicles = signal<Vehicle[]>([]);
  filter = signal('');
  columns = ['identifier', 'brand', 'model', 'mileage', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.service.getAll().subscribe(v => this.vehicles.set(v));
  }

  filtered(): Vehicle[] {
    const q = this.filter().toLowerCase().trim();
    if (!q) return this.vehicles();
    return this.vehicles().filter(v =>
        [v.brand, v.model, v.registrationNew, v.registrationOld, v.customIdentifier]
            .some(f => f?.toLowerCase().includes(q))
    );
  }

  onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  open(v: Vehicle): void {
    this.router.navigate(['/vehicles', v.id]);
  }

  openCreate(): void {
    this.dialog.open(VehicleFormDialog, { width: '560px' })
        .afterClosed().subscribe(created => {
      if (created) {
        this.snackbar.open('Véhicule créé.', 'OK', { duration: 3000 });
        this.load();
      }
    });
  }

  edit(v: Vehicle): void {
    // On passe le véhicule au dialogue : il s'ouvrira en mode édition
    this.dialog.open(VehicleFormDialog, { width: '560px', data: v })
        .afterClosed().subscribe(updated => {
      if (updated) {
        this.snackbar.open('Véhicule modifié.', 'OK', { duration: 3000 });
        this.load();
      }
    });
  }

  remove(v: Vehicle): void {
    if (!confirm(`Supprimer ${VehicleService.label(v)} ? Le journal associé sera perdu.`)) return;
    this.service.delete(v.id).subscribe({
      next: () => { this.snackbar.open('Véhicule supprimé.', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snackbar.open('Suppression impossible.', 'OK', { duration: 4000 })
    });
  }
}