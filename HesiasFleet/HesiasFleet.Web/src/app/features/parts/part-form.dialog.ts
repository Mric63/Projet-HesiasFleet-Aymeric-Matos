import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { toSignal } from '@angular/core/rxjs-interop';
import { PartService } from '../../core/services/part.service';
import { Part } from '../../core/models';

export interface PartDialogData {
  categories: string[];
  brands: string[];
  references: string[];
  part?: Part;
}

@Component({
  selector: 'app-part-form-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatAutocompleteModule
  ],
  template: `
    <h2 mat-dialog-title>{{ data.part ? 'Modifier la pièce' : 'Nouvelle pièce' }}</h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <mat-form-field class="full-width">
          <mat-label>Catégorie</mat-label>
          <input matInput formControlName="category" [matAutocomplete]="catAuto"
                 placeholder="Filtre à huile">
          <mat-autocomplete #catAuto="matAutocomplete">
            @for (c of filteredCategories(); track c) {
              <mat-option [value]="c">{{ c }}</mat-option>
            }
          </mat-autocomplete>
          @if (form.controls.category.hasError('required') && form.controls.category.touched) {
            <mat-error>Obligatoire</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Marque</mat-label>
          <input matInput formControlName="brand" [matAutocomplete]="brandAuto"
                 placeholder="Purflux">
          <mat-autocomplete #brandAuto="matAutocomplete">
            @for (b of filteredBrands(); track b) {
              <mat-option [value]="b">{{ b }}</mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Référence</mat-label>
          <input matInput formControlName="reference" [matAutocomplete]="refAuto"
                 placeholder="LS923">
          <mat-autocomplete #refAuto="matAutocomplete">
            @for (r of filteredReferences(); track r) {
              <mat-option [value]="r">{{ r }}</mat-option>
            }
          </mat-autocomplete>
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Stock minimum</mat-label>
          <input matInput type="number" formControlName="minimum" min="0">
          <mat-hint>0 désactive l'alerte de stock pour cette pièce</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving()">
        {{ data.part ? 'Enregistrer' : 'Créer' }}
      </button>
    </mat-dialog-actions>
  `,
  styles: [`form { display: flex; flex-direction: column; padding-top: 8px; }`]
})
export class PartFormDialog {
  private fb = inject(FormBuilder);
  private service = inject(PartService);
  private ref = inject(MatDialogRef<PartFormDialog>);
  data = inject<PartDialogData>(MAT_DIALOG_DATA);

  saving = signal(false);

  form = this.fb.nonNullable.group({
    category: ['', Validators.required],
    brand: ['', Validators.required],
    reference: ['', Validators.required],
    minimum: [0, Validators.min(0)]
  });

  constructor() {
    // En mode édition, on pré-remplit avec la pièce existante
    if (this.data.part) {
      this.form.patchValue({
        category: this.data.part.category,
        brand: this.data.part.brand,
        reference: this.data.part.reference,
        minimum: this.data.part.minimum
      });
    }
  }

  // Les valeurs saisies pilotent le filtrage des suggestions
  private categoryValue = toSignal(this.form.controls.category.valueChanges, { initialValue: '' });
  private brandValue = toSignal(this.form.controls.brand.valueChanges, { initialValue: '' });
  private referenceValue = toSignal(this.form.controls.reference.valueChanges, { initialValue: '' });

  filteredCategories = () => this.filterList(this.data.categories, this.categoryValue());
  filteredBrands = () => this.filterList(this.data.brands, this.brandValue());
  filteredReferences = () => this.filterList(this.data.references, this.referenceValue());

  private filterList(source: string[], query: string): string[] {
    const q = (query ?? '').toLowerCase();
    return source.filter(v => v.toLowerCase().includes(q));
  }

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    const value = this.form.getRawValue();

    // En édition on fait un PUT, en création un POST
    const request$ = this.data.part
        ? this.service.update(this.data.part.id, value)
        : this.service.create(value);

    request$.subscribe({
      next: p => this.ref.close(p),
      error: () => this.saving.set(false)
    });
  }
}