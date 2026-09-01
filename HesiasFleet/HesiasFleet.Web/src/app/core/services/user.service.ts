import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { CreateUser, User } from '../models';

@Injectable({ providedIn: 'root' })
export class UserService {
    private http = inject(HttpClient);
    private base = `${environment.apiUrl}/users`;

    getAll() { return this.http.get<User[]>(this.base); }
    getById(id: number) { return this.http.get<User>(`${this.base}/${id}`); }
    create(dto: CreateUser) { return this.http.post<User>(this.base, dto); }
    delete(id: number) { return this.http.delete<void>(`${this.base}/${id}`); }
}