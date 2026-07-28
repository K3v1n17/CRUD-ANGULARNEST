import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  combineLatest,
  debounceTime,
  distinctUntilChanged,
  map,
  shareReplay,
  startWith,
} from 'rxjs';
import { Cliente } from '../models/cliente.model';
import * as ClientesActions from '../store/clientes.actions';
import {
  selectClientesError,
  selectClientesItems,
  selectClientesLimit,
  selectClientesLoading,
  selectClientesPage,
  selectClientesTotal,
} from '../store/clientes.selectors';
import * as AuthActions from '../../auth/store/auth.actions';

@Component({
  selector: 'app-clientes-list',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './clientes-list.component.html',
})
export class ClientesListComponent implements OnInit {
  private readonly store = inject(Store);

  searchControl = new FormControl('', { nonNullable: true });

  clientes$ = this.store.select(selectClientesItems);
  loading$ = this.store.select(selectClientesLoading);
  error$ = this.store.select(selectClientesError);
  total$ = this.store.select(selectClientesTotal);
  page$ = this.store.select(selectClientesPage);
  limit$ = this.store.select(selectClientesLimit);
  totalPages$ = combineLatest([this.total$, this.limit$]).pipe(
    map(([total, limit]) => Math.max(1, Math.ceil(total / limit))),
  );

  private readonly searchTerm$ = this.searchControl.valueChanges.pipe(
    startWith(''),
    debounceTime(300),
    distinctUntilChanged(),
    map((term) => term.trim().toLowerCase()),
  );

  filteredClientes$ = combineLatest([this.clientes$, this.searchTerm$]).pipe(
    map(([clientes, term]) =>
      term
        ? clientes.filter((c) => this.matches(c, term))
        : clientes,
    ),
    shareReplay(1),
  );

  clienteAEliminar: Cliente | null = null;

  ngOnInit(): void {
    this.store.dispatch(ClientesActions.loadClientes({ page: 1, limit: 10 }));
  }

  irAPagina(page: number, limit: number): void {
    if (page < 1) return;
    this.store.dispatch(ClientesActions.loadClientes({ page, limit }));
  }

  pedirConfirmacion(cliente: Cliente): void {
    this.clienteAEliminar = cliente;
  }

  cancelarEliminacion(): void {
    this.clienteAEliminar = null;
  }

  confirmarEliminacion(): void {
    if (!this.clienteAEliminar) return;
    this.store.dispatch(ClientesActions.removeCliente({ id: this.clienteAEliminar.id }));
    this.clienteAEliminar = null;
  }

  logout(): void {
    this.store.dispatch(AuthActions.logout());
  }

  iniciales(cliente: Cliente): string {
    return `${cliente.nombres?.[0] ?? ''}${cliente.apellidos?.[0] ?? ''}`.toUpperCase();
  }

  private matches(cliente: Cliente, term: string): boolean {
    const nombreCompleto = `${cliente.nombres} ${cliente.apellidos}`.toLowerCase();
    return (
      nombreCompleto.includes(term) ||
      cliente.cedula.toLowerCase().includes(term) ||
      cliente.email.toLowerCase().includes(term)
    );
  }
}
