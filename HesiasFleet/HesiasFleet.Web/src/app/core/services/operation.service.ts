import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateMetaOperation, CreateOperation, MetaOperation, Operation } from '../models';

@Injectable({ providedIn: 'root' })
export class OperationService {
  private http = inject(HttpClient);
  private ops = `${environment.apiUrl}/operations`;
  private metas = `${environment.apiUrl}/metaoperations`;

  getByVehicle(vehicleId: number) {
    return this.http.get<Operation[]>(`${this.ops}/vehicle/${vehicleId}`);
  }
  create(dto: CreateOperation) { return this.http.post<Operation>(this.ops, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.ops}/${id}`); }

  getMetasByVehicle(vehicleId: number) {
    return this.http.get<MetaOperation[]>(`${this.metas}/vehicle/${vehicleId}`);
  }
  createMeta(dto: CreateMetaOperation) {
    return this.http.post<MetaOperation>(this.metas, dto);
  }
  deleteMeta(id: number) { return this.http.delete<void>(`${this.metas}/${id}`); }
}
