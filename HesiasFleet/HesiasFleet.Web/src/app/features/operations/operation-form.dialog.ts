import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { provideNativeDateAdapter } from '@angular/material/core';

import { OperationService } from '../../core/services/operation.service';
import { CreateOperation, Part } from '../../core/models';

export interface OperationDialogData {
  vehicleId: number;
  defaultMileage: number;
  defaultDate: Date;
  parts: Part[];
}

@Component({
  selector: 'app-operation-form-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatSelectModule, MatButtonModule, MatIconModule, MatDatepickerModule,
    MatSlideToggleModule, MatDividerModule, MatButtonToggleModule
  ],
  template: `
    <h2 mat-dialog-title>Saisir une opération</h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-button-toggle-group formControlName="mode" class="mode-toggle">
          <mat-button-toggle value="simple">Opération simple</mat-button-toggle>
          <mat-button-toggle value="meta">Méta-opération</mat-button-toggle>
        </mat-button-toggle-group>

        <div class="row">
          <mat-form-field>
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date">
            <mat-datepicker-toggle matIconSuffix [for]="picker" />
            <mat-datepicker #picker />
            <mat-hint>Reprise de la dernière saisie</mat-hint>
          </mat-form-field>

          <mat-form-field>
            <mat-label>Kilométrage</mat-label>
            <input matInput type="number" formControlName="mileage" min="0">
            <span matTextSuffix>km</span>
            <mat-hint>Reprise de la dernière saisie</mat-hint>
          </mat-form-field>
        </div>

        <mat-form-field class="full-width">
          <mat-label>Libellé</mat-label>
          <input matInput formControlName="label"
                 [placeholder]="isMeta() ? 'Vidange moteur' : 'Remplacement filtre à huile'">
          @if (form.controls.label.hasError('required') && form.controls.label.touched) {
            <mat-error>Le libellé est obligatoire</mat-error>
          }
        </mat-form-field>

        <!-- BUTÉE -->
        <mat-slide-toggle formControlName="hasDeadline">
          Cette opération est récurrente (butée)
        </mat-slide-toggle>

        @if (form.controls.hasDeadline.value) {
          <div class="row deadline-row">
            <mat-form-field>
              <mat-label>Butée calendaire</mat-label>
              <input matInput [matDatepicker]="dlPicker" formControlName="deadlineDate">
              <mat-datepicker-toggle matIconSuffix [for]="dlPicker" />
              <mat-datepicker #dlPicker />
            </mat-form-field>

            <mat-form-field>
              <mat-label>Butée kilométrique</mat-label>
              <input matInput type="number" formControlName="deadlineMileage" min="0">
              <span matTextSuffix>km</span>
            </mat-form-field>
          </div>
          <p class="hint">
            Renseignez l'une, l'autre ou les deux. L'alerte se déclenche dès que
            la première échéance est atteinte.
          </p>
          @if (deadlineError()) {
            <p class="error-msg">Renseignez au moins une des deux butées.</p>
          }
        }

        <!-- MODE SIMPLE : consommables + pièces libres -->
        @if (!isMeta()) {
          <mat-divider />

          <div class="section-header">
            <span>Consommables (déstockés automatiquement)</span>
            <button mat-button type="button" (click)="addConsumable()">
              <mat-icon>add</mat-icon> Ajouter
            </button>
          </div>

          <div formArrayName="consumables">
            @for (c of consumables.controls; track $index) {
              <div class="row item-row" [formGroupName]="$index">
                <mat-form-field class="grow">
                  <mat-label>Pièce du magasin</mat-label>
                  <mat-select formControlName="partId">
                    @for (p of data.parts; track p.id) {
                      <mat-option [value]="p.id">
                        {{ p.category }} — {{ p.brand }} {{ p.reference }}
                      </mat-option>
                    }
                  </mat-select>
                </mat-form-field>
                <mat-form-field class="qty">
                  <mat-label>Qté</mat-label>
                  <input matInput type="number" formControlName="quantity" min="1">
                </mat-form-field>
                <button mat-icon-button type="button" (click)="removeConsumable($index)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
          </div>

          <div class="section-header">
            <span>Pièces détachées libres (hors stock)</span>
            <button mat-button type="button" (click)="addSparePart()">
              <mat-icon>add</mat-icon> Ajouter
            </button>
          </div>

          <div formArrayName="spareParts">
            @for (s of spareParts.controls; track $index) {
              <div class="row item-row" [formGroupName]="$index">
                <mat-form-field class="grow">
                  <mat-label>Désignation</mat-label>
                  <input matInput formControlName="label" placeholder="Joint de carter">
                </mat-form-field>
                <mat-form-field class="qty">
                  <mat-label>Prix</mat-label>
                  <input matInput type="number" formControlName="unitCost" min="0" step="0.01">
                  <span matTextSuffix>€</span>
                </mat-form-field>
                <button mat-icon-button type="button" (click)="removeSparePart($index)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
          </div>
        }

        <!-- MODE META : opérations composantes -->
        @if (isMeta()) {
          <mat-divider />
          <div class="section-header">
            <span>Opérations composantes</span>
            <button mat-button type="button" (click)="addChild()">
              <mat-icon>add</mat-icon> Ajouter
            </button>
          </div>

          <div formArrayName="children">
            @for (c of children.controls; track $index) {
              <div class="row item-row" [formGroupName]="$index">
                <mat-form-field class="grow">
                  <mat-label>Libellé</mat-label>
                  <input matInput formControlName="label"
                         placeholder="Remplacement filtre à huile">
                </mat-form-field>
                <button mat-icon-button type="button" (click)="removeChild($index)">
                  <mat-icon>close</mat-icon>
                </button>
              </div>
            }
          </div>

          @if (childrenError()) {
            <p class="error-msg">Une méta-opération doit contenir au moins une opération.</p>
          }
        }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving()">
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    .mode-toggle { margin-bottom: 16px; align-self: flex-start; }
    .deadline-row { margin-top: 12px; }
    mat-divider { margin: 20px 0 12px; }
    .section-header {
      display: flex; align-items: center; justify-content: space-between;
      font-weight: 500; margin: 12px 0 4px;
    }
    .item-row { align-items: center; }
    .item-row .grow { flex: 3 1 200px; }
    .item-row .qty { flex: 1 1 90px; }
    .item-row button { flex: 0 0 auto; }
    .hint { font-size: 12px; opacity: .7; margin: 4px 0 0; }
    .error-msg { color: var(--mat-sys-error); font-size: 14px; margin: 8px 0 0; }
  `]
})
export class OperationFormDialog {
  private fb = inject(FormBuilder);
  private service = inject(OperationService);
  private ref = inject(MatDialogRef<OperationFormDialog>);
  data = inject<OperationDialogData>(MAT_DIALOG_DATA);

  saving = signal(false);
  deadlineError = signal(false);
  childrenError = signal(false);

  form = this.fb.nonNullable.group({
    mode: ['simple' as 'simple' | 'meta'],
    date: [this.data.defaultDate, Validators.required],
    mileage: [this.data.defaultMileage, [Validators.required, Validators.min(0)]],
    label: ['', Validators.required],
    hasDeadline: [false],
    deadlineDate: [null as Date | null],
    deadlineMileage: [null as number | null],
    consumables: this.fb.array<any>([]),
    spareParts: this.fb.array<any>([]),
    children: this.fb.array<any>([])
  });

  isMeta(): boolean { return this.form.controls.mode.value === 'meta'; }

  get consumables(): FormArray { return this.form.controls.consumables as unknown as FormArray; }
  get spareParts(): FormArray { return this.form.controls.spareParts as unknown as FormArray; }
  get children(): FormArray { return this.form.controls.children as unknown as FormArray; }

  addConsumable(): void {
    this.consumables.push(this.fb.nonNullable.group({
      partId: [null as number | null, Validators.required],
      quantity: [1, [Validators.required, Validators.min(1)]]
    }));
  }
  removeConsumable(i: number): void { this.consumables.removeAt(i); }

  addSparePart(): void {
    this.spareParts.push(this.fb.nonNullable.group({
      label: ['', Validators.required],
      unitCost: [null as number | null]
    }));
  }
  removeSparePart(i: number): void { this.spareParts.removeAt(i); }

  addChild(): void {
    this.children.push(this.fb.nonNullable.group({ label: ['', Validators.required] }));
  }
  removeChild(i: number): void { this.children.removeAt(i); }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    // Si l'utilisateur active la butée, il doit en renseigner au moins une des deux
    if (raw.hasDeadline && !raw.deadlineDate && raw.deadlineMileage == null) {
      this.deadlineError.set(true);
      return;
    }
    this.deadlineError.set(false);

    const deadlineDate = raw.hasDeadline && raw.deadlineDate
      ? raw.deadlineDate.toISOString() : null;
    const deadlineMileage = raw.hasDeadline ? raw.deadlineMileage : null;

    const common = {
      vehicleId: this.data.vehicleId,
      date: raw.date.toISOString(),
      mileage: raw.mileage,
      deadlineDate,
      deadlineMileage
    };

    this.saving.set(true);

    if (this.isMeta()) {
      const childLabels = (raw.children as { label: string }[])
        .filter(c => c.label.trim() !== '');

      if (childLabels.length === 0) {
        this.childrenError.set(true);
        this.saving.set(false);
        return;
      }
      this.childrenError.set(false);

      this.service.createMeta({
        ...common,
        label: raw.label,
        // La butée est portée par la méta, pas par ses composantes
        operations: childLabels.map<CreateOperation>(c => ({
          vehicleId: this.data.vehicleId,
          date: common.date,
          mileage: common.mileage,
          label: c.label,
          deadlineDate: null,
          deadlineMileage: null,
          consumables: [],
          spareParts: []
        }))
      }).subscribe({
        next: m => this.ref.close(m),
        error: () => this.saving.set(false)
      });
      return;
    }

    this.service.create({
      ...common,
      label: raw.label,
      consumables: (raw.consumables as { partId: number; quantity: number }[])
        .filter(c => c.partId != null),
      spareParts: (raw.spareParts as { label: string; unitCost: number | null }[])
        .filter(s => s.label.trim() !== '')
    }).subscribe({
      next: o => this.ref.close(o),
      error: err => {
        this.saving.set(false);
        // Le back refuse si le stock est insuffisant pour un consommable
        if (err.status === 400) {
          alert(err.error?.message ?? 'Stock insuffisant pour un des consommables.');
        }
      }
    });
  }
}
