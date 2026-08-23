import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { AuthService } from './core/services/auth.service';
import { NotificationService } from './core/services/notification.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    RouterOutlet, RouterLink, RouterLinkActive,
    MatToolbarModule, MatIconModule, MatButtonModule,
    MatSidenavModule, MatListModule, MatBadgeModule, MatMenuModule
  ],
  template: `
    @if (auth.isAuthenticated()) {
      <mat-sidenav-container class="shell">
        <mat-sidenav mode="side" opened class="sidenav">
          <div class="brand">
            <span class="brand-badge">HF</span>
            <span class="brand-name">Hesias<br>Fleet</span>
          </div>

          <mat-nav-list class="nav">
            <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
              <mat-icon matListItemIcon>dashboard</mat-icon>
              <span matListItemTitle>Tableau de bord</span>
            </a>
            <a mat-list-item routerLink="/vehicles" routerLinkActive="active">
              <mat-icon matListItemIcon>directions_car</mat-icon>
              <span matListItemTitle>Véhicules</span>
            </a>
            <a mat-list-item routerLink="/parts" routerLinkActive="active">
              <mat-icon matListItemIcon>inventory_2</mat-icon>
              <span matListItemTitle>Magasin</span>
            </a>
          </mat-nav-list>

          <div class="sidenav-footer">Gestion de flotte</div>
        </mat-sidenav>

        <mat-sidenav-content>
          <mat-toolbar class="topbar">
            <span class="spacer"></span>

            <button mat-icon-button routerLink="/dashboard"
                    [matBadge]="notifications.notifications().length || null"
                    matBadgeColor="warn"
                    aria-label="Alertes de butée">
              <mat-icon>notifications</mat-icon>
            </button>

            <button mat-button class="user-btn" [matMenuTriggerFor]="userMenu">
              <mat-icon>account_circle</mat-icon>
              <span class="user-name">{{ auth.displayName() }}</span>
            </button>
            <mat-menu #userMenu="matMenu">
              <button mat-menu-item (click)="auth.logout()">
                <mat-icon>logout</mat-icon>
                <span>Déconnexion</span>
              </button>
            </mat-menu>
          </mat-toolbar>
          <div class="hazard-stripe"></div>

          <router-outlet />
        </mat-sidenav-content>
      </mat-sidenav-container>
    } @else {
      <router-outlet />
    }
  `,
  styles: [`
    .shell { height: 100vh; }

    /* --- Sidenav : aplat charbon --- */
    .sidenav {
      width: 244px;
      background: var(--hf-charcoal) !important;
      border-right: none !important;
      display: flex;
      flex-direction: column;
    }

    .brand {
      display: flex; align-items: center; gap: 12px;
      padding: 22px 20px 20px;
    }
    .brand-badge {
      background: var(--hf-amber);
      color: var(--hf-charcoal);
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 800; font-size: 20px;
      padding: 4px 9px; line-height: 1;
      border-radius: 4px;
    }
    .brand-name {
      color: var(--hf-cream);
      font-family: 'Barlow Condensed', sans-serif;
      font-weight: 700; font-size: 19px;
      text-transform: uppercase; letter-spacing: 0.03em;
      line-height: 0.98;
    }

    .nav { padding-top: 8px; flex: 1; }

    /* Liens de navigation sur fond sombre */
    .sidenav ::ng-deep .mat-mdc-list-item {
      color: #c9c4b6 !important;
      margin: 2px 10px;
      border-radius: 8px;
      width: auto;
    }
    .sidenav ::ng-deep .mat-mdc-list-item .mdc-list-item__primary-text {
      color: #c9c4b6 !important;
      font-weight: 500;
    }
    .sidenav ::ng-deep .mat-mdc-list-item .mat-icon { color: #8f8a7c; }
    .sidenav ::ng-deep .mat-mdc-list-item:hover {
      background: rgba(242,183,5,0.08) !important;
    }

    /* Lien actif : fond ambre subtil, barre + texte clair */
    .sidenav ::ng-deep .active {
      background: rgba(242,183,5,0.14) !important;
      box-shadow: inset 3px 0 0 var(--hf-amber);
    }
    .sidenav ::ng-deep .active .mdc-list-item__primary-text {
      color: var(--hf-cream) !important;
      font-weight: 600;
    }
    .sidenav ::ng-deep .active .mat-icon { color: var(--hf-amber); }

    .sidenav-footer {
      padding: 16px 20px;
      color: #6a6558;
      font-size: 12px;
      text-transform: uppercase;
      letter-spacing: 0.1em;
      border-top: 1px solid rgba(255,255,255,0.06);
    }

    /* --- Topbar : claire, discrète --- */
    .topbar {
      background: var(--mat-sys-surface-container) !important;
      color: var(--hf-ink) !important;
      border-bottom: 1px solid var(--mat-sys-outline);
      height: 60px;
    }
    .user-btn { font-weight: 600; }
    .user-name { margin-left: 6px; }
    .spacer { flex: 1 1 auto; }
  `]
})
export class App implements OnInit {
  auth = inject(AuthService);
  notifications = inject(NotificationService);

  ngOnInit(): void {
    // Charge les alertes dès qu'une session existe
    if (this.auth.isAuthenticated()) {
      this.notifications.refresh();
    }
  }
}
