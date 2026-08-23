import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateNote, Note } from '../models';

@Injectable({ providedIn: 'root' })
export class NoteService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/notes`;

  getByVehicle(vehicleId: number) {
    return this.http.get<Note[]>(`${this.base}/vehicle/${vehicleId}`);
  }
  create(dto: CreateNote) { return this.http.post<Note>(this.base, dto); }
  delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}
