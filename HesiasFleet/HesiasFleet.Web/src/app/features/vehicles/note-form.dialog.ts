import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { provideNativeDateAdapter } from '@angular/material/core';
import { NoteService } from '../../core/services/note.service';
import { Operation } from '../../core/models';

export interface NoteDialogData {
  vehicleId: number;
  defaultMileage: number;
  operations: Operation[];   // opérations du véhicule, pour le rattachement optionnel
}

@Component({
  selector: 'app-note-form-dialog',
  standalone: true,
  providers: [provideNativeDateAdapter()],
  imports: [
    ReactiveFormsModule, MatDialogModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatDatepickerModule, MatSelectModule
  ],
  template: `
    <h2 mat-dialog-title>Ajouter une note</h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <div class="row">
          <mat-form-field>
            <mat-label>Date</mat-label>
            <input matInput [matDatepicker]="picker" formControlName="date">
            <mat-datepicker-toggle matIconSuffix [for]="picker" />
            <mat-datepicker #picker />
          </mat-form-field>

          <mat-form-field>
            <mat-label>Kilométrage</mat-label>
            <input matInput type="number" formControlName="mileage" min="0">
            <span matTextSuffix>km</span>
          </mat-form-field>
        </div>

        <mat-form-field class="full-width">
          <mat-label>Contenu</mat-label>
          <textarea matInput rows="5" formControlName="content"
                    placeholder="Bruit suspect côté avant droit…"></textarea>
          @if (form.controls.content.hasError('required') && form.controls.content.touched) {
            <mat-error>La note ne peut pas être vide</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Rattacher à une opération (facultatif)</mat-label>
          <mat-select formControlName="operationId">
            <mat-option [value]="null">— Note libre —</mat-option>
            @for (op of data.operations; track op.id) {
              <mat-option [value]="op.id">{{ op.label }}</mat-option>
            }
          </mat-select>
          <mat-hint>Laisser sur « Note libre » pour une note indépendante</mat-hint>
        </mat-form-field>
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving()">
        Enregistrer
      </button>
    </mat-dialog-actions>
  `,
  styles: [`form { display: flex; flex-direction: column; padding-top: 8px; }`]
})
export class NoteFormDialog {
  private fb = inject(FormBuilder);
  private service = inject(NoteService);
  private ref = inject(MatDialogRef<NoteFormDialog>);
  data = inject<NoteDialogData>(MAT_DIALOG_DATA);
  saving = signal(false);

  form = this.fb.nonNullable.group({
    date: [new Date(), Validators.required],
    mileage: [this.data.defaultMileage],
    content: ['', Validators.required],
    operationId: [null as number | null]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const raw = this.form.getRawValue();
    this.saving.set(true);

    this.service.create({
      vehicleId: this.data.vehicleId,
      content: raw.content,
      date: raw.date.toISOString(),
      mileage: raw.mileage,
      operationId: raw.operationId,
      metaOperationId: null
    }).subscribe({
      next: n => this.ref.close(n),
      error: () => this.saving.set(false)
    });
  }
}