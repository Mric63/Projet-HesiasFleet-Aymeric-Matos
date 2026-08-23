import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateVehicle, DeadlineStatus, Vehicle } from '../models';

@Injectable({ providedIn: 'root' })
export class VehicleService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/vehicles`;

  getAll() { return this.http.get<Vehicle[]>(this.base); }
  getById(id: number) { return this.http.get<Vehicle>(`${this.base}/${id}`); }
  create(dto: CreateVehicle) { return this.http.post<Vehicle>(this.base, dto); }
  update(id: number, dto: CreateVehicle) { return this.http.put<Vehicle>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }


  // Les butées sont exposées par OperationsController
  getDeadlines(vehicleId: number) {
    return this.http.get<DeadlineStatus[]>(
      `${environment.apiUrl}/operations/vehicle/${vehicleId}/deadlines`
    );
  }

  // Libellé lisible : marque modèle (identifiant)
  static label(v: Vehicle): string {
    const id = v.registrationNew ?? v.registrationOld ?? v.customIdentifier;
    const base = `${v.brand} ${v.model}`.trim();
    return id ? `${base} (${id})` : base;
  }
}
