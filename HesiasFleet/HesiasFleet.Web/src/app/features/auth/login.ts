import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule, MatFormFieldModule, MatInputModule,
    MatButtonModule, MatIconModule, MatProgressBarModule
  ],
  template: `
    <div class="login-wrapper">
      <div class="login-card">
        @if (loading()) { <mat-progress-bar mode="indeterminate" /> }

        <div class="login-head">
          <span class="brand-badge">HF</span>
          <div class="brand-text">
            <div class="brand-name">Hesias Fleet</div>
            <div class="brand-sub">Console de gestion</div>
          </div>
        </div>
        <div class="hazard-stripe"></div>

        <form [formGroup]="form" (ngSubmit)="submit()" class="login-body">
          <h2 class="login-title">Connexion</h2>

          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Identifiant</mat-label>
            <input matInput formControlName="login" autocomplete="username">
            <mat-icon matPrefix>person</mat-icon>
            @if (form.controls.login.hasError('required') && form.controls.login.touched) {
              <mat-error>L'identifiant est obligatoire</mat-error>
            }
          </mat-form-field>

          <mat-form-field class="full-width" appearance="outline">
            <mat-label>Mot de passe</mat-label>
            <input matInput type="password" formControlName="password"
                   autocomplete="current-password">
            <mat-icon matPrefix>lock</mat-icon>
            @if (form.controls.password.hasError('required') && form.controls.password.touched) {
              <mat-error>Le mot de passe est obligatoire</mat-error>
            }
          </mat-form-field>

          @if (error()) {
            <p class="error-msg">{{ error() }}</p>
          }

          <button mat-flat-button color="primary" class="full-width submit-btn"
                  type="submit" [disabled]="loading()">
            Se connecter
          </button>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .login-wrapper {
      height: 100vh; display: flex; align-items: center; justify-content: center;
      background:
        var(--hf-charcoal)
        repeating-linear-gradient(-45deg, transparent 0 40px, rgba(242,183,5,0.04) 40px 80px);
    }
    .login-card {
      width: 400px;
      background: var(--mat-sys-surface-container);
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 20px 60px rgba(0,0,0,0.4);
    }
    .login-head {
      display: flex; align-items: center; gap: 14px;
      padding: 24px 28px;
      background: var(--hf-charcoal);
    }
    .brand-badge {
      background: var(--hf-amber);
      color: var(--hf-charcoal);
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800; font-size: 24px;
      padding: 6px 11px; line-height: 1;
      border-radius: 5px;
    }
    .brand-name {
      color: var(--hf-cream);
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700; font-size: 24px;
      text-transform: uppercase; letter-spacing: 0.03em;
      line-height: 1;
    }
    .brand-sub {
      color: #8f8a7c; font-size: 13px;
      text-transform: uppercase; letter-spacing: 0.08em;
      margin-top: 3px;
    }
    .login-body { display: flex; flex-direction: column; gap: 6px; padding: 28px; }
    .login-title { margin: 0 0 12px; color: var(--hf-ink); }
    .submit-btn { margin-top: 8px; height: 46px; font-size: 16px; }
    .error-msg {
      color: var(--mat-sys-error); margin: 4px 0 8px; font-size: 14px;
      background: #fbeceb; border-radius: 6px; padding: 10px 12px;
    }
  `]
})
export class LoginPage {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private notifications = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  loading = signal(false);
  error = signal<string | null>(null);

  form = this.fb.nonNullable.group({
    login: ['', Validators.required],
    password: ['', Validators.required]
  });

  submit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.auth.login(this.form.getRawValue()).subscribe({
      next: () => {
        this.notifications.refresh();
        const returnUrl = this.route.snapshot.queryParamMap.get('returnUrl') ?? '/dashboard';
        this.router.navigateByUrl(returnUrl);
      },
      error: err => {
        this.loading.set(false);
        this.error.set(
          err.status === 401
            ? 'Identifiant ou mot de passe incorrect.'
            : "Impossible de joindre le serveur. Vérifiez que l'API est démarrée."
        );
      }
    });
  }
}
