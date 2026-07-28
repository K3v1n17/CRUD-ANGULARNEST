import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Cliente, ClienteFormValue, ClientesPage } from '../models/cliente.model';

@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly baseUrl = `${environment.apiUrl}/clientes`;

  constructor(private readonly http: HttpClient) {}

  getAll(page: number, limit: number): Observable<ClientesPage> {
    return this.http.get<ClientesPage>(this.baseUrl, {
      params: { page, limit },
    });
  }

  getById(id: number): Observable<Cliente> {
    return this.http.get<Cliente>(`${this.baseUrl}/${id}`);
  }

  create(dto: ClienteFormValue): Observable<Cliente> {
    return this.http.post<Cliente>(this.baseUrl, dto);
  }

  update(id: number, dto: Partial<ClienteFormValue>): Observable<Cliente> {
    return this.http.patch<Cliente>(`${this.baseUrl}/${id}`, dto);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}
