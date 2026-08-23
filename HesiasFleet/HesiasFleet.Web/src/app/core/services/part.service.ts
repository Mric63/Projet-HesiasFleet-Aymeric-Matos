import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { forkJoin, of, switchMap } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  CreatePart, Part, StockAdjust, StockConsume, StockEntryInput, StockStatus
} from '../models';

@Injectable({ providedIn: 'root' })
export class PartService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/parts`;

  getAll() { return this.http.get<Part[]>(this.base); }
  getById(id: number) { return this.http.get<Part>(`${this.base}/${id}`); }
  create(dto: CreatePart) { return this.http.post<Part>(this.base, dto); }
  update(id: number, dto: CreatePart) { return this.http.put<Part>(`${this.base}/${id}`, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }

  getStock(id: number) {
    return this.http.get<StockStatus>(`${this.base}/${id}/stock`);
  }

  addStock(id: number, dto: StockEntryInput) {
    return this.http.post<void>(`${this.base}/${id}/stock/entry`, dto);
  }

  consumeStock(id: number, dto: StockConsume) {
    return this.http.post<void>(`${this.base}/${id}/stock/consume`, dto);
  }

  adjustStock(id: number, dto: StockAdjust) {
    return this.http.post<void>(`${this.base}/${id}/stock/adjust`, dto);
  }

  // Vue "magasin" : l'API n'a pas d'endpoint agrégé, on compose côté client
  getStockOverview() {
    return this.getAll().pipe(
        switchMap(parts =>
            parts.length === 0
                ? of([] as StockStatus[])
                : forkJoin(parts.map(p => this.getStock(p.id)))
        )
    );
  }

  // Valeurs distinctes pour l'autocomplétion des catégories/marques/références
  static distinct(parts: Part[], field: 'category' | 'brand' | 'reference'): string[] {
    return [...new Set(parts.map(p => p[field]).filter(Boolean))].sort();
  }
}