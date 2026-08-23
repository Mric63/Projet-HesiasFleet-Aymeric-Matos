import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { MatCardModule } from '@angular/material/card';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatListModule } from '@angular/material/list';
import { MatTableModule } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatExpansionModule } from '@angular/material/expansion';

import { VehicleService } from '../../core/services/vehicle.service';
import { OperationService } from '../../core/services/operation.service';
import { NoteService } from '../../core/services/note.service';
import { PartService } from '../../core/services/part.service';
import { NotificationService } from '../../core/services/notification.service';
import {
  DeadlineStatus, JournalEntry, MetaOperation, Note, Operation, Part, Vehicle
} from '../../core/models';
import { OperationFormDialog } from '../operations/operation-form.dialog';
import { NoteFormDialog } from './note-form.dialog';

@Component({
  selector: 'app-vehicle-detail',
  standalone: true,
  imports: [
    DatePipe, DecimalPipe, RouterLink,
    MatCardModule, MatTabsModule, MatIconModule, MatButtonModule, MatChipsModule,
    MatListModule, MatTableModule, MatExpansionModule
  ],
  template: `
    <div class="page">
      @if (vehicle(); as v) {
        <div class="page-header">
          <div>
            <a mat-button routerLink="/vehicles">
              <mat-icon>arrow_back</mat-icon> Véhicules
            </a>
            <h1>{{ v.brand }} {{ v.model }}</h1>
            <div class="identifiers">
              @if (v.registrationNew) { <mat-chip>{{ v.registrationNew }}</mat-chip> }
              @if (v.registrationOld) { <mat-chip>{{ v.registrationOld }}</mat-chip> }
              @if (v.customIdentifier) { <mat-chip>{{ v.customIdentifier }}</mat-chip> }
              <mat-chip highlighted>{{ v.mileage | number }} km</mat-chip>
            </div>
          </div>
          <div class="header-actions">
            <button mat-flat-button color="primary" (click)="addOperation()">
              <mat-icon>build</mat-icon> Saisir une opération
            </button>
            <button mat-stroked-button (click)="addNote()">
              <mat-icon>sticky_note_2</mat-icon> Ajouter une note
            </button>
          </div>
        </div>

        <mat-tab-group>
          <!-- ONGLET JOURNAL -->
          <mat-tab label="Journal">
            @if (journal().length === 0) {
              <p class="empty-state">Le journal de ce véhicule est vide.</p>
            } @else {
              <div class="timeline">
                @for (entry of journal(); track entry.kind + '-' + $index) {
                  <div class="entry" [class]="entry.kind">
                    <div class="entry-marker">
                      <mat-icon>{{ iconFor(entry.kind) }}</mat-icon>
                    </div>
                    <mat-card class="entry-card">
                      <div class="entry-head">
                        <strong>{{ entry.label }}</strong>
                        <span class="entry-meta">
                          {{ entry.date | date:'dd/MM/yyyy' }}
                          @if (entry.mileage != null) {
                            · {{ entry.mileage | number }} km
                          }
                        </span>
                      </div>

                      @if (entry.kind === 'meta') {
                        <mat-accordion>
                          <mat-expansion-panel>
                            <mat-expansion-panel-header>
                              <mat-panel-title>
                                {{ asMeta(entry).operations.length }} opération(s) composante(s)
                              </mat-panel-title>
                            </mat-expansion-panel-header>
                            <mat-list>
                              @for (op of asMeta(entry).operations; track op.id) {
                                <mat-list-item>
                                  <mat-icon matListItemIcon>chevron_right</mat-icon>
                                  <span matListItemTitle>{{ op.label }}</span>
                                </mat-list-item>
                              }
                            </mat-list>
                          </mat-expansion-panel>
                        </mat-accordion>
                      }

                      @if (entry.kind === 'operation') {
                        @if (asOperation(entry).consumables.length > 0) {
                          <div class="detail-line">
                            <span class="detail-label">Consommables :</span>
                            @for (c of asOperation(entry).consumables; track c.partId) {
                              <mat-chip>{{ partLabel(c.partId) }} × {{ c.quantity }}</mat-chip>
                            }
                          </div>
                        }
                        @if (asOperation(entry).spareParts.length > 0) {
                          <div class="detail-line">
                            <span class="detail-label">Pièces libres :</span>
                            @for (p of asOperation(entry).spareParts; track p.label) {
                              <mat-chip>
                                {{ p.label }}
                                @if (p.unitCost != null) { — {{ p.unitCost }} € }
                              </mat-chip>
                            }
                          </div>
                        }
                      }

                      @if (entry.kind === 'note') {
                        <p class="note-content">{{ asNote(entry).content }}</p>
                      }
                    </mat-card>
                  </div>
                }
              </div>
            }
          </mat-tab>

          <!-- ONGLET BUTÉES -->
          <mat-tab label="Butées">
            @if (deadlines().length === 0) {
              <p class="empty-state">Aucune opération récurrente enregistrée.</p>
            } @else {
              <table mat-table [dataSource]="deadlines()" class="deadline-table">
                <ng-container matColumnDef="label">
                  <th mat-header-cell *matHeaderCellDef>Opération</th>
                  <td mat-cell *matCellDef="let d">{{ d.label }}</td>
                </ng-container>

                <ng-container matColumnDef="date">
                  <th mat-header-cell *matHeaderCellDef>Échéance calendaire</th>
                  <td mat-cell *matCellDef="let d">
                    @if (d.deadlineDate) {
                      {{ d.deadlineDate | date:'dd/MM/yyyy' }}
                      <small [class.overdue]="d.daysRemaining < 0">
                        ({{ relativeDays(d.daysRemaining) }})
                      </small>
                    } @else { — }
                  </td>
                </ng-container>

                <ng-container matColumnDef="mileage">
                  <th mat-header-cell *matHeaderCellDef>Échéance kilométrique</th>
                  <td mat-cell *matCellDef="let d">
                    @if (d.deadlineMileage != null) {
                      {{ d.deadlineMileage | number }} km
                      <small [class.overdue]="d.kilometersRemaining < 0">
                        ({{ relativeKm(d.kilometersRemaining) }})
                      </small>
                    } @else { — }
                  </td>
                </ng-container>

                <ng-container matColumnDef="status">
                  <th mat-header-cell *matHeaderCellDef>État</th>
                  <td mat-cell *matCellDef="let d">
                    @if (d.isDue) {
                      <mat-chip highlighted color="warn">À effectuer</mat-chip>
                    } @else {
                      <mat-chip>OK</mat-chip>
                    }
                  </td>
                </ng-container>

                <tr mat-header-row *matHeaderRowDef="deadlineColumns"></tr>
                <tr mat-row *matRowDef="let row; columns: deadlineColumns"></tr>
              </table>
            }
          </mat-tab>

          <!-- ONGLET FICHE -->
          <mat-tab label="Fiche">
            <mat-card class="info-card">
              <mat-list>
                <mat-list-item>
                  <span matListItemTitle>Marque</span>
                  <span matListItemLine>{{ v.brand }}</span>
                </mat-list-item>
                <mat-list-item>
                  <span matListItemTitle>Modèle</span>
                  <span matListItemLine>{{ v.model }}</span>
                </mat-list-item>
                <mat-list-item>
                  <span matListItemTitle>Kilométrage</span>
                  <span matListItemLine>{{ v.mileage | number }} km</span>
                </mat-list-item>
                @for (p of v.properties; track p.key) {
                  <mat-list-item>
                    <span matListItemTitle>{{ p.key }}</span>
                    <span matListItemLine>{{ p.value }}</span>
                  </mat-list-item>
                }
              </mat-list>
            </mat-card>
          </mat-tab>
        </mat-tab-group>
      } @else {
        <p class="empty-state">Chargement…</p>
      }
    </div>
  `,
  styles: [`
    h1 { margin: 8px 0; }
    .identifiers { display: flex; gap: 8px; flex-wrap: wrap; }
    .header-actions { display: flex; gap: 8px; }
    .timeline { padding: 24px 0; }
    .entry { display: flex; gap: 16px; margin-bottom: 16px; }
    .entry-marker {
      flex: 0 0 40px; height: 40px; border-radius: 50%;
      display: flex; align-items: center; justify-content: center;
      background: var(--mat-sys-secondary-container);
    }
    .entry.note .entry-marker { background: var(--mat-sys-tertiary-container); }
    .entry-card { flex: 1; padding: 16px; }
    .entry-head { display: flex; justify-content: space-between; gap: 16px; }
    .entry-meta { font-size: 13px; opacity: .7; white-space: nowrap; }
    .detail-line {
      display: flex; align-items: center; gap: 8px;
      flex-wrap: wrap; margin-top: 12px;
    }
    .detail-label { font-size: 13px; opacity: .7; }
    .note-content { margin: 8px 0 0; white-space: pre-wrap; }
    .deadline-table, .info-card { margin-top: 24px; }
    .overdue { color: var(--mat-sys-error); font-weight: 500; }
  `]
})
export class VehicleDetailPage implements OnInit {
  // Alimenté par le router grâce à withComponentInputBinding()
  @Input() id!: string;

  private vehicleService = inject(VehicleService);
  private operationService = inject(OperationService);
  private noteService = inject(NoteService);
  private partService = inject(PartService);
  private notificationService = inject(NotificationService);
  private dialog = inject(MatDialog);
  private snackbar = inject(MatSnackBar);

  vehicle = signal<Vehicle | null>(null);
  operations = signal<Operation[]>([]);
  metaOperations = signal<MetaOperation[]>([]);
  notes = signal<Note[]>([]);
  deadlines = signal<DeadlineStatus[]>([]);
  parts = signal<Part[]>([]);

  deadlineColumns = ['label', 'date', 'mileage', 'status'];

  private get vehicleId(): number { return Number(this.id); }

  ngOnInit(): void { this.load(); }

  load(): void {
    const id = this.vehicleId;
    forkJoin({
      vehicle: this.vehicleService.getById(id),
      operations: this.operationService.getByVehicle(id),
      metas: this.operationService.getMetasByVehicle(id),
      notes: this.noteService.getByVehicle(id),
      deadlines: this.vehicleService.getDeadlines(id),
      parts: this.partService.getAll()
    }).subscribe(res => {
      this.vehicle.set(res.vehicle);
      this.operations.set(res.operations);
      this.metaOperations.set(res.metas);
      this.notes.set(res.notes);
      this.deadlines.set(res.deadlines);
      this.parts.set(res.parts);
    });
  }

  // Le journal fusionne opérations, méta-opérations et notes, triés du plus récent au plus ancien.
  // Les opérations composantes d'une méta ne sont pas répétées : elles s'affichent dans la méta.
  journal(): JournalEntry[] {
    const metaChildIds = new Set(
      this.metaOperations().flatMap(m => m.operations.map(o => o.id))
    );

    const entries: JournalEntry[] = [
      ...this.operations()
        .filter(o => !metaChildIds.has(o.id))
        .map(o => ({
          kind: 'operation' as const,
          date: o.date, mileage: o.mileage, label: o.label, ref: o
        })),
      ...this.metaOperations().map(m => ({
        kind: 'meta' as const,
        date: m.date, mileage: m.mileage, label: m.label, ref: m
      })),
      ...this.notes().map(n => ({
        kind: 'note' as const,
        date: n.date, mileage: n.mileage, label: 'Note', ref: n
      }))
    ];

    return entries.sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  // Casts pour le template (Angular ne rétrécit pas les unions dans les vues)
  asOperation(e: JournalEntry): Operation { return e.ref as Operation; }
  asMeta(e: JournalEntry): MetaOperation { return e.ref as MetaOperation; }
  asNote(e: JournalEntry): Note { return e.ref as Note; }

  iconFor(kind: string): string {
    return kind === 'note' ? 'sticky_note_2' : kind === 'meta' ? 'account_tree' : 'build';
  }

  partLabel(partId: number): string {
    const p = this.parts().find(x => x.id === partId);
    return p ? `${p.category} ${p.brand} ${p.reference}` : `Pièce #${partId}`;
  }

  relativeDays(days: number | null | undefined): string {
    if (days == null) return '';
    if (days < 0) return `en retard de ${Math.abs(days)} j`;
    if (days === 0) return "aujourd'hui";
    return `dans ${days} j`;
  }

  relativeKm(km: number | null | undefined): string {
    if (km == null) return '';
    return km < 0
      ? `dépassé de ${Math.abs(km).toLocaleString('fr-FR')} km`
      : `dans ${km.toLocaleString('fr-FR')} km`;
  }

  addOperation(): void {
    const v = this.vehicle();
    if (!v) return;

    // Assistance à la saisie : le km et la date de la dernière opération servent de défaut
    const last = this.operations()[0];

    this.dialog.open(OperationFormDialog, {
      width: '720px',
      data: {
        vehicleId: v.id,
        defaultMileage: last?.mileage ?? v.mileage,
        defaultDate: last?.date ? new Date(last.date) : new Date(),
        parts: this.parts()
      }
    }).afterClosed().subscribe(created => {
      if (created) {
        this.snackbar.open('Opération enregistrée.', 'OK', { duration: 3000 });
        this.load();
        this.notificationService.refresh();
      }
    });
  }

  addNote(): void {
    const v = this.vehicle();
    if (!v) return;

    this.dialog.open(NoteFormDialog, {
      width: '520px',
      data: { vehicleId: v.id, defaultMileage: v.mileage, operations: this.operations() }
    }).afterClosed().subscribe(created => {
      if (created) {
        this.snackbar.open('Note ajoutée.', 'OK', { duration: 3000 });
        this.load();
      }
    });
  }
}
