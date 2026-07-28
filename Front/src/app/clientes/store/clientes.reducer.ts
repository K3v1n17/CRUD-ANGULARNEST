import { createReducer, on } from '@ngrx/store';
import { Cliente } from '../models/cliente.model';
import * as ClientesActions from './clientes.actions';

export interface ClientesState {
  items: Cliente[];
  total: number;
  page: number;
  limit: number;
  loading: boolean;
  saving: boolean;
  error: string | null;
}

export const initialClientesState: ClientesState = {
  items: [],
  total: 0,
  page: 1,
  limit: 10,
  loading: false,
  saving: false,
  error: null,
};

export const clientesReducer = createReducer(
  initialClientesState,

  on(ClientesActions.loadClientes, (state) => ({
    ...state,
    loading: true,
    error: null,
  })),
  on(ClientesActions.loadClientesSuccess, (state, { data, total, page, limit }) => ({
    ...state,
    items: data,
    total,
    page,
    limit,
    loading: false,
  })),
  on(ClientesActions.loadClientesFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error,
  })),

  on(ClientesActions.createCliente, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(ClientesActions.createClienteSuccess, (state) => ({
    ...state,
    saving: false,
  })),
  on(ClientesActions.createClienteFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),

  on(ClientesActions.updateCliente, (state) => ({
    ...state,
    saving: true,
    error: null,
  })),
  on(ClientesActions.updateClienteSuccess, (state) => ({
    ...state,
    saving: false,
  })),
  on(ClientesActions.updateClienteFailure, (state, { error }) => ({
    ...state,
    saving: false,
    error,
  })),

  on(ClientesActions.removeCliente, (state) => ({
    ...state,
    error: null,
  })),
  on(ClientesActions.removeClienteSuccess, (state, { id }) => ({
    ...state,
    items: state.items.filter((c) => c.id !== id),
    total: state.total - 1,
  })),
  on(ClientesActions.removeClienteFailure, (state, { error }) => ({
    ...state,
    error,
  })),
);
