import { Component, inject, signal } from '@angular/core';
import { FormArray, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { VehicleService } from '../../core/services/vehicle.service';
import { Vehicle } from '../../core/models';

@Component({
  selector: 'app-vehicle-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatDividerModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data ? 'Modifier le véhicule' : 'Nouveau véhicule' }}</h2>
    <mat-dialog-content>
      <form [formGroup]="form">
        <div class="row">
          <mat-form-field>
            <mat-label>Marque</mat-label>
            <input matInput formControlName="brand">
            @if (form.controls.brand.hasError('required') && form.controls.brand.touched) {
              <mat-error>Obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Modèle</mat-label>
            <input matInput formControlName="model">
          </mat-form-field>
        </div>

        <div class="row">
          <mat-form-field>
            <mat-label>Immatriculation (nouvelle forme)</mat-label>
            <input matInput formControlName="registrationNew" placeholder="AA-123-BB">
          </mat-form-field>

          <mat-form-field>
            <mat-label>Immatriculation (ancienne forme)</mat-label>
            <input matInput formControlName="registrationOld" placeholder="1234 AB 63">
          </mat-form-field>
        </div>

        <mat-form-field class="full-width">
          <mat-label>Identifiant interne</mat-label>
          <input matInput formControlName="customIdentifier">
          <mat-hint>Pour les véhicules non immatriculés (engins de chantier…)</mat-hint>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Kilométrage actuel</mat-label>
          <input matInput type="number" formControlName="mileage" min="0">
          <span matTextSuffix>km</span>
        </mat-form-field>

        @if (identityError()) {
          <p class="error-msg">
            Renseignez au moins une immatriculation ou un identifiant interne.
          </p>
        }

        <mat-divider />

        <div class="props-header">
          <span>Propriétés étendues</span>
          <button mat-button type="button" (click)="addProperty()">
            <mat-icon>add</mat-icon> Ajouter
          </button>
        </div>

        <div formArrayName="properties">
          @for (prop of properties.controls; track $index) {
            <div class="row prop-row" [formGroupName]="$index">
              <mat-form-field>
                <mat-label>Clé</mat-label>
                <input matInput formControlName="key" placeholder="Type moteur">
              </mat-form-field>
              <mat-form-field>
                <mat-label>Valeur</mat-label>
                <input matInput formControlName="value" placeholder="DW10FC">
              </mat-form-field>
              <button mat-icon-button type="button" (click)="removeProperty($index)">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          }
        </div>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving()">
        {{ data ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`
    form { display: flex; flex-direction: column; gap: 4px; padding-top: 8px; }
    mat-divider { margin: 16px 0; }
    .props-header {
      display: flex; align-items: center; justify-content: space-between;
      margin-bottom: 8px; font-weight: 500;
    }
    .prop-row { align-items: center; }
    .prop-row button { flex: 0 0 auto; }
    .error-msg { color: var(--mat-sys-error); font-size: 14px; margin: 0; }
  `]
})
export class VehicleFormDialog {
  private fb = inject(FormBuilder);
  private service = inject(VehicleService);
  private ref = inject(MatDialogRef<VehicleFormDialog>);
  data = inject<Vehicle | null>(MAT_DIALOG_DATA, { optional: true });

  saving = signal(false);
  identityError = signal(false);

  form = this.fb.nonNullable.group({
    brand: ['', Validators.required],
    model: [''],
    registrationNew: [''],
    registrationOld: [''],
    customIdentifier: [''],
    mileage: [0, [Validators.required, Validators.min(0)]],
    properties: this.fb.array<ReturnType<VehicleFormDialog['newProperty']>>([])
  });

  get properties(): FormArray {
    return this.form.controls.properties as unknown as FormArray;
  }

  constructor() {
    // En mode édition, on pré-remplit le formulaire avec le véhicule existant
    if (this.data) {
      this.form.patchValue({
        brand: this.data.brand,
        model: this.data.model,
        registrationNew: this.data.registrationNew ?? '',
        registrationOld: this.data.registrationOld ?? '',
        customIdentifier: this.data.customIdentifier ?? '',
        mileage: this.data.mileage
      });
      // Reconstruit une ligne par propriété étendue existante
      for (const p of this.data.properties) {
        this.properties.push(this.fb.nonNullable.group({ key: [p.key], value: [p.value] }));
      }
    }
  }

  private newProperty() {
    return this.fb.nonNullable.group({ key: [''], value: [''] });
  }

  addProperty(): void { this.properties.push(this.newProperty()); }
  removeProperty(i: number): void { this.properties.removeAt(i); }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();

    // Règle métier : un véhicule doit être identifiable d'une manière ou d'une autre
    const hasIdentity =
      !!raw.registrationNew?.trim() ||
      !!raw.registrationOld?.trim() ||
      !!raw.customIdentifier?.trim();

    if (!hasIdentity) {
      this.identityError.set(true);
      return;
    }
    this.identityError.set(false);

    this.saving.set(true);

    // Le corps envoyé est identique en création et en édition
    const payload = {
      brand: raw.brand,
      model: raw.model,
      registrationNew: raw.registrationNew || null,
      registrationOld: raw.registrationOld || null,
      customIdentifier: raw.customIdentifier || null,
      mileage: raw.mileage,
      // On ignore les lignes vides laissées par l'utilisateur
      properties: (raw.properties as { key: string; value: string }[])
          .filter(p => p.key.trim() !== '')
    };

    // En édition on fait un PUT, en création un POST
    const request$ = this.data
        ? this.service.update(this.data.id, payload)
        : this.service.create(payload);

    request$.subscribe({
      next: v => this.ref.close(v),
      error: () => this.saving.set(false)
    });
  }
}
