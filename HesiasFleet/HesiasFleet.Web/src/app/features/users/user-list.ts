import { Component, OnInit, inject, signal } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { User } from '../../core/models';
import { UserFormDialog } from './user-form.dialog';

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [MatCardModule, MatTableModule, MatButtonModule, MatIconModule],
    template: `
    <div class="page">
      <div class="page-header">
        <h1>Utilisateurs</h1>
        <button mat-flat-button color="primary" (click)="openCreate()">
          <mat-icon>person_add</mat-icon> Nouvel utilisateur
        </button>
      </div>

      <mat-card>
        <mat-card-content>
          @if (users().length === 0) {
            <p class="empty-state">Aucun utilisateur enregistré.</p>
          } @else {
            <table mat-table [dataSource]="users()">
              <ng-container matColumnDef="name">
                <th mat-header-cell *matHeaderCellDef>Nom</th>
                <td mat-cell *matCellDef="let u">{{ u.firstName }} {{ u.lastName }}</td>
              </ng-container>

              <ng-container matColumnDef="function">
                <th mat-header-cell *matHeaderCellDef>Fonction</th>
                <td mat-cell *matCellDef="let u">{{ u.function || '—' }}</td>
              </ng-container>

              <ng-container matColumnDef="email">
                <th mat-header-cell *matHeaderCellDef>Email</th>
                <td mat-cell *matCellDef="let u">{{ u.email }}</td>
              </ng-container>

              <ng-container matColumnDef="login">
                <th mat-header-cell *matHeaderCellDef>Identifiant</th>
                <td mat-cell *matCellDef="let u">{{ u.login }}</td>
              </ng-container>

              <ng-container matColumnDef="actions">
                <th mat-header-cell *matHeaderCellDef></th>
                <td mat-cell *matCellDef="let u">
                  <button mat-icon-button color="warn" (click)="remove(u)"
                          [disabled]="isCurrentUser(u)"
                          aria-label="Supprimer">
                    <mat-icon>delete</mat-icon>
                  </button>
                </td>
              </ng-container>

              <tr mat-header-row *matHeaderRowDef="columns"></tr>
              <tr mat-row *matRowDef="let row; columns: columns"></tr>
            </table>
          }
        </mat-card-content>
      </mat-card>
    </div>
  `
})
export class UserListPage implements OnInit {
    private service = inject(UserService);
    private auth = inject(AuthService);
    private dialog = inject(MatDialog);
    private snackbar = inject(MatSnackBar);

    users = signal<User[]>([]);
    columns = ['name', 'function', 'email', 'login', 'actions'];

    ngOnInit(): void { this.load(); }

    load(): void {
        this.service.getAll().subscribe(u => this.users.set(u));
    }

    // On empêche l'utilisateur connecté de supprimer son propre compte
    isCurrentUser(u: User): boolean {
        return this.auth.currentUser()?.id === u.id;
    }

    openCreate(): void {
        this.dialog.open(UserFormDialog, { width: '560px' })
            .afterClosed().subscribe(created => {
            if (created) {
                this.snackbar.open('Utilisateur créé.', 'OK', { duration: 3000 });
                this.load();
            }
        });
    }

    remove(u: User): void {
        if (!confirm(`Supprimer le compte de ${u.firstName} ${u.lastName} ?`)) return;
        this.service.delete(u.id).subscribe({
            next: () => { this.snackbar.open('Utilisateur supprimé.', 'OK', { duration: 3000 }); this.load(); },
            error: () => this.snackbar.open('Suppression impossible.', 'OK', { duration: 4000 })
        });
    }
}