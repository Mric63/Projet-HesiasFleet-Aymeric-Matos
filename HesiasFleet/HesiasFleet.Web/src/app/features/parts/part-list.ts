import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

import { PartService } from '../../core/services/part.service';
import { Part, StockStatus } from '../../core/models';
import { PartFormDialog } from './part-form.dialog';
import { StockMovementDialog, StockMovementMode } from './stock-movement.dialog';

@Component({
  selector: 'app-part-list',
  standalone: true,
  imports: [
    MatCardModule, MatTableModule, MatButtonModule, MatIconModule, MatChipsModule,
    MatMenuModule, MatFormFieldModule, MatInputModule
  ],
  template: `
    <div class="page">
      <div class="page-header">
        <h1>Magasin</h1>
        <button mat-flat-button color="primary" (click)="openCreate()">
          <mat-icon>add</mat-icon> Nouvelle pièce
        </button>
      </div>

      @if (alerts().length > 0) {
        <mat-card class="alert-banner">
          <mat-icon>warning</mat-icon>
          <span>
            {{ alerts().length }} pièce(s) sous le seuil minimum.
          </span>
        </mat-card>
      }

      <mat-card>
        <mat-card-content>
          <mat-form-field class="full-width">
            <mat-label>Rechercher</mat-label>
            <input matInput (input)="onFilter($event)"
                   placeholder="Catégorie, marque, référence…">
            <mat-icon matSuffix>search</mat-icon>
          </mat-form-field>

          @if (filtered().length === 0) {
            <p class="empty-state">Aucune pièce au magasin.</p>
          } @else {
            <table mat-table [dataSource]="filtered()">
              <ng-container matColumnDef="category">
                <th mat-header-cell *matHeaderCellDef>Catégorie</th>
                <td mat-cell *matCellDef="let s">{{ s.category }}</td>
              </ng-container>

              <ng-container matColumnDef="brand">
                <th mat-header-cell *matHeaderCellDef>Marque</th>
                <td mat-cell *matCellDef="let s">{{ s.brand }}</td>
              </ng-container>

              <ng-container matColumnDef="reference">
                <th mat-header-cell *matHeaderCellDef>Référence</th>
                <td mat-cell *matCellDef="let s">{{ s.reference }}</td>
              </ng-container>

              <ng-container matColumnDef="quantity">
                <th mat-header-cell *matHeaderCellDef>Disponible</th>
                <td mat-cell *matCellDef="let s">
                  <strong [class.low]="s.isBelowMinimum">{{ s.availableQuantity }}</strong>
                </td>
              </ng-container>

              <ng-container matColumnDef="minimum">
                <th mat-header-cell *matHeaderCellDef>Minimum</th>
                <td mat-cell *matCellDef="let s">{{ s.minimum }}</td>
              </ng-container>

              <ng-container matColumnDef="status">
                <th mat-header-cell *matHeaderCellDef>État</th>
                <td mat-cell *matCellDef="let s">
                  @if (s.isBelowMinimum) {
                    <mat-chip highlighted color="warn">Réapprovisionner</mat-chip>
                  } @else {
                    <mat-chip>OK</mat-chip>
                  }
                </td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let s">
                  <button mat-icon-button [matMenuTriggerFor]="menu">
                    <mat-icon>more_vert</mat-icon>
                  </button>
                  <mat-menu #menu="matMenu">
                    <button mat-menu-item (click)="edit(s)">
                      <mat-icon>edit</mat-icon>
                      <span>Modifier la dénomination</span>
                    </button>
                    <button mat-menu-item (click)="movement(s, 'entry')">
                      <mat-icon>add_shopping_cart</mat-icon>
                      <span>Entrée de stock</span>
                    </button>
                    <button mat-menu-item (click)="movement(s, 'consume')">
                      <mat-icon>remove_shopping_cart</mat-icon>
                      <span>Consommation manuelle</span>
                    </button>
                    <button mat-menu-item (click)="movement(s, 'adjust')">
                      <mat-icon>tune</mat-icon>
                      <span>Ajuster (casse, inventaire)</span>
                    </button>
                    <button mat-menu-item (click)="remove(s)">
                      <mat-icon color="warn">delete</mat-icon>
                      <span>Supprimer la pièce</span>
                    </button>
                  </mat-menu>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `,
  styles: [`
    .alert-banner {
      display: flex; align-items: center; gap: 12px; padding: 16px;
      margin-bottom: 16px;
      background: var(--mat-sys-error-container);
      color: var(--mat-sys-on-error-container);
    }
    .low { color: var(--mat-sys-error); }
  `]
})
export class PartListPage implements OnInit {
  private service = inject(PartService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  stock = signal<StockStatus[]>([]);
  parts = signal<Part[]>([]);
  filter = signal('');

  columns = ['category', 'brand', 'reference', 'quantity', 'minimum', 'status', 'actions'];

  ngOnInit(): void { this.load(); }

  load(): void {
    this.service.getStockOverview().subscribe(s => this.stock.set(s));
    this.service.getAll().subscribe(p => this.parts.set(p));
  }

  alerts(): StockStatus[] {
    return this.stock().filter(s => s.isBelowMinimum);
  }

  filtered(): StockStatus[] {
    const q = this.filter().toLowerCase().trim();
    if (!q) return this.stock();
    return this.stock().filter(s =>
        [s.category, s.brand, s.reference].some(f => f.toLowerCase().includes(q))
    );
  }

  onFilter(event: Event): void {
    this.filter.set((event.target as HTMLInputElement).value);
  }

  openCreate(): void {
    this.dialog.open(PartFormDialog, {
      width: '520px',
      data: {
        categories: PartService.distinct(this.parts(), 'category'),
        brands: PartService.distinct(this.parts(), 'brand'),
        references: PartService.distinct(this.parts(), 'reference')
      }
    }).afterClosed().subscribe(created => {
      if (created) {
        this.snackbar.open('Pièce créée.', 'OK', { duration: 3000 });
        this.load();
      }
    });
  }

  edit(s: StockStatus): void {
    // La ligne du tableau est un StockStatus ; on reconstruit le Part attendu par le dialogue
    const part: Part = {
      id: s.partId,
      category: s.category,
      brand: s.brand,
      reference: s.reference,
      minimum: s.minimum
    };
    this.dialog.open(PartFormDialog, {
      width: '520px',
      data: {
        categories: PartService.distinct(this.parts(), 'category'),
        brands: PartService.distinct(this.parts(), 'brand'),
        references: PartService.distinct(this.parts(), 'reference'),
        part
      }
    }).afterClosed().subscribe(updated => {
      if (updated) {
        this.snackbar.open('Pièce modifiée.', 'OK', { duration: 3000 });
        this.load();
      }
    });
  }

  movement(s: StockStatus, mode: StockMovementMode): void {
    this.dialog.open(StockMovementDialog, {
      width: '440px',
      data: { mode, status: s }
    }).afterClosed().subscribe(done => {
      if (done) {
        this.snackbar.open('Stock mis à jour.', 'OK', { duration: 3000 });
        this.load();
      }
    });
  }

  remove(s: StockStatus): void {
    if (!confirm(`Supprimer ${s.category} ${s.brand} ${s.reference} du magasin ?`)) return;
    this.service.delete(s.partId).subscribe({
      next: () => { this.snackbar.open('Pièce supprimée.', 'OK', { duration: 3000 }); this.load(); },
      error: () => this.snackbar.open(
          'Suppression impossible : la pièce est utilisée par une opération.',
          'OK', { duration: 5000 }
      )
    });
  }
}