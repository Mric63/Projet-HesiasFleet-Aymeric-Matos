import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { UserService } from '../../core/services/user.service';

@Component({
    selector: 'app-user-form-dialog',
    standalone: true,
    imports: [
        ReactiveFormsModule, MatDialogModule, MatFormFieldModule,
        MatInputModule, MatButtonModule
    ],
    template: `
    <h2 mat-dialog-title>Nouvel utilisateur</h2>

    <mat-dialog-content>
      <form [formGroup]="form">
        <div class="row">
          <mat-form-field>
            <mat-label>Prénom</mat-label>
            <input matInput formControlName="firstName">
            @if (form.controls.firstName.hasError('required') && form.controls.firstName.touched) {
              <mat-error>Obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field>
            <mat-label>Nom</mat-label>
            <input matInput formControlName="lastName">
            @if (form.controls.lastName.hasError('required') && form.controls.lastName.touched) {
              <mat-error>Obligatoire</mat-error>
            }
          </mat-form-field>
        </div>

        <mat-form-field class="full-width">
          <mat-label>Fonction</mat-label>
          <input matInput formControlName="function" placeholder="Responsable magasin">
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Email</mat-label>
          <input matInput type="email" formControlName="email">
          @if (form.controls.email.hasError('email') && form.controls.email.touched) {
            <mat-error>Adresse email invalide</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Identifiant de connexion</mat-label>
          <input matInput formControlName="login" autocomplete="off">
          @if (form.controls.login.hasError('required') && form.controls.login.touched) {
            <mat-error>Obligatoire</mat-error>
          }
        </mat-form-field>

        <mat-form-field class="full-width">
          <mat-label>Mot de passe</mat-label>
          <input matInput type="password" formControlName="password" autocomplete="new-password">
          <mat-hint>8 caractères minimum</mat-hint>
          @if (form.controls.password.hasError('minlength') && form.controls.password.touched) {
            <mat-error>8 caractères minimum</mat-error>
          }
        </mat-form-field>

        @if (error()) { <p class="error-msg">{{ error() }}</p> }
      </form>
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Annuler</button>
      <button mat-flat-button color="primary" (click)="submit()" [disabled]="saving()">
        Créer
      </button>
    </mat-dialog-actions>
  `,
    styles: [`
    form { display: flex; flex-direction: column; padding-top: 8px; }
    .error-msg { color: var(--mat-sys-error); font-size: 14px; margin: 4px 0 0; }
  `]
})
export class UserFormDialog {
    private fb = inject(FormBuilder);
    private service = inject(UserService);
    private ref = inject(MatDialogRef<UserFormDialog>);

    saving = signal(false);
    error = signal<string | null>(null);

    form = this.fb.nonNullable.group({
        firstName: ['', Validators.required],
        lastName: ['', Validators.required],
        function: [''],
        email: ['', [Validators.required, Validators.email]],
        login: ['', Validators.required],
        password: ['', [Validators.required, Validators.minLength(8)]]
    });

    submit(): void {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.saving.set(true);
        this.error.set(null);

        this.service.create(this.form.getRawValue()).subscribe({
            next: u => this.ref.close(u),
            error: err => {
                this.saving.set(false);
                // L'email et le login sont uniques en base : un doublon remonte en 500
                this.error.set(
                    err.status === 409 || err.status === 500
                        ? 'Cet email ou cet identifiant est déjà utilisé.'
                        : "Impossible de créer l'utilisateur."
                );
            }
        });
    }
}