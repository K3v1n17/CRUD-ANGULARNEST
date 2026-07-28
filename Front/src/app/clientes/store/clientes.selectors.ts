import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ClientesState } from './clientes.reducer';

export const selectClientesState = createFeatureSelector<ClientesState>('clientes');

export const selectClientesItems = createSelector(
  selectClientesState,
  (state) => state.items,
);

export const selectClientesTotal = createSelector(
  selectClientesState,
  (state) => state.total,
);

export const selectClientesPage = createSelector(
  selectClientesState,
  (state) => state.page,
);

export const selectClientesLimit = createSelector(
  selectClientesState,
  (state) => state.limit,
);

export const selectClientesLoading = createSelector(
  selectClientesState,
  (state) => state.loading,
);

export const selectClientesSaving = createSelector(
  selectClientesState,
  (state) => state.saving,
);

export const selectClientesError = createSelector(
  selectClientesState,
  (state) => state.error,
);
