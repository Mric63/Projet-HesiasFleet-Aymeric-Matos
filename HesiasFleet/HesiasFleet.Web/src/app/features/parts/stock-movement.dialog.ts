import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { PartService } from '../../core/services/part.service';
import { StockStatus } from '../../core/models';

export type StockMovementMode = 'entry' | 'consume' | 'adjust';

export interface StockMovementData {
  mode: StockMovementMode;
  status: StockStatus;
}

@Component({
  selector: 'app-stock-movement-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule
  ],
  template: `
    <h2 mat-dialog-title>{{ title() }}</h2>

    <mat-dialog-content>
      <p class="part-label">
        {{ data.status.category }} — {{ data.status.brand }} {{ data.status.reference }}
        <br>
        <small>Disponible actuellement : {{ data.status.availableQuantity }}</small>
      </p>

      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>{{ quantityLabel() }}</mat-label>
          <input matInput type="number" formControlName="quantity" min="0">
          @if (form.controls.quantity.hasError('min')) {
            <mat-error>La quantité doit être positive</mat-error>
          }
        </mat-form-field>

        @if (data.mode === 'entry') {
          <mat-form-field class="full-width">
            <mat-label>Prix de revient unitaire</mat-label>
            <input matInput type="number" formControlName="unitCost" min="0" step="0.01">
            <span matTextSuffix>€</span>
            <mat-hint>
              Le déstockage consomme en priorité les lots les moins chers.
            </mat-hint>
          </mat-form-field>
        }

        @if (error()) { <p class="error-msg">{{ error() }}</p> }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving()">
        Valider
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    .part-label { margin-bottom: 16px; }
    form { display: flex; flex-direction: column; }
    .error-msg { color: var(--mat-sys-error); font-size: 14px; margin: 0; }
  `]
})
export class StockMovementDialog {
  private fb = inject(FormBuilder);
  private service = inject(PartService);
  private ref = inject(MatDialogRef<StockMovementDialog>);
  data = inject<StockMovementData>(MAT_DIALOG_DATA);

  saving = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    quantity: [
      this.data.mode === 'adjust' ? this.data.status.availableQuantity : 1,
      [Validators.required, Validators.min(0)]
    ],
    unitCost: [0, Validators.min(0)]
  });

  title(): string {
    switch (this.data.mode) {
      case 'entry': return 'Entrée de stock';
      case 'consume': return 'Consommation de stock';
      case 'adjust': return 'Ajustement de stock';
    }
  }

  quantityLabel(): string {
    switch (this.data.mode) {
      case 'entry': return 'Quantité reçue';
      case 'consume': return 'Quantité consommée';
      case 'adjust': return 'Nouvelle quantité réelle';
    }
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { quantity, unitCost } = this.form.getRawValue();
    const id = this.data.status.partId;

    this.saving.set(true);
    this.error.set(null);

    const request =
      this.data.mode === 'entry' ? this.service.addStock(id, { quantity, unitCost })
      : this.data.mode === 'consume' ? this.service.consumeStock(id, { quantity })
      : this.service.adjustStock(id, { newQuantity: quantity });

    request.subscribe({
      next: () => this.ref.close(true),
      error: err => {
        this.saving.set(false);
        this.error.set(
          err.status === 400
            ? 'Stock insuffisant pour cette opération.'
            : err.status === 401
              ? 'Session expirée : reconnectez-vous.'
              : 'Erreur lors de la mise à jour du stock.'
        );
      }
    });
  }
}
