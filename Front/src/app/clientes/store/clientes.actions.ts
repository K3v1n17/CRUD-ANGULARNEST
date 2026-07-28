import { createAction, props } from '@ngrx/store';
import { Cliente, ClienteFormValue } from '../models/cliente.model';

export const loadClientes = createAction(
  '[Clientes] Load',
  props<{ page: number; limit: number }>(),
);

export const loadClientesSuccess = createAction(
  '[Clientes] Load Success',
  props<{ data: Cliente[]; total: number; page: number; limit: number }>(),
);

export const loadClientesFailure = createAction(
  '[Clientes] Load Failure',
  props<{ error: string }>(),
);

export const createCliente = createAction(
  '[Clientes] Create',
  props<{ dto: ClienteFormValue }>(),
);

export const createClienteSuccess = createAction(
  '[Clientes] Create Success',
  props<{ cliente: Cliente }>(),
);

export const createClienteFailure = createAction(
  '[Clientes] Create Failure',
  props<{ error: string }>(),
);

export const updateCliente = createAction(
  '[Clientes] Update',
  props<{ id: number; dto: Partial<ClienteFormValue> }>(),
);

export const updateClienteSuccess = createAction(
  '[Clientes] Update Success',
  props<{ cliente: Cliente }>(),
);

export const updateClienteFailure = createAction(
  '[Clientes] Update Failure',
  props<{ error: string }>(),
);

export const removeCliente = createAction(
  '[Clientes] Remove',
  props<{ id: number }>(),
);

export const removeClienteSuccess = createAction(
  '[Clientes] Remove Success',
  props<{ id: number }>(),
);

export const removeClienteFailure = createAction(
  '[Clientes] Remove Failure',
  props<{ error: string }>(),
);
