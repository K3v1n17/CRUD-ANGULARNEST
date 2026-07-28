import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ClienteService } from '../services/cliente.service';
import { ClienteFormValue } from '../models/cliente.model';
import * as ClientesActions from '../store/clientes.actions';
import { selectClientesError, selectClientesSaving } from '../store/clientes.selectors';

type Modo = 'create' | 'edit' | 'view';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './cliente-form.component.html',
})
export class ClienteFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly store = inject(Store);
  private readonly route = inject(ActivatedRoute);
  private readonly clienteService = inject(ClienteService);

  modo: Modo = 'create';
  clienteId: number | null = null;
  cargando = false;

  saving$ = this.store.select(selectClientesSaving);
  error$ = this.store.select(selectClientesError);

  form = this.fb.group({
    cedula: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(13)]],
    nombres: ['', [Validators.required, Validators.maxLength(100)]],
    apellidos: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    telefono: ['', [Validators.maxLength(15)]],
    direccion: ['', [Validators.maxLength(250)]],
    fecha_nacimiento: [''],
  });

  get esSoloLectura(): boolean {
    return this.modo === 'view';
  }

  get titulo(): string {
    if (this.modo === 'create') return 'Nuevo cliente';
    if (this.modo === 'view') return 'Detalle del cliente';
    return 'Editar cliente';
  }

  ngOnInit(): void {
    this.modo = (this.route.snapshot.data['modo'] as Modo) ?? 'create';
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.clienteId = Number(idParam);
      this.cargando = true;
      this.clienteService.getById(this.clienteId).subscribe({
        next: (cliente) => {
          this.form.patchValue(cliente);
          this.cargando = false;
          if (this.esSoloLectura) {
            this.form.disable();
          }
        },
        error: () => {
          this.cargando = false;
        },
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const dto = this.limpiarCamposOpcionalesVacios(
      this.form.getRawValue() as ClienteFormValue,
    );

    if (this.modo === 'create') {
      this.store.dispatch(ClientesActions.createCliente({ dto }));
    } else if (this.modo === 'edit' && this.clienteId) {
      this.store.dispatch(ClientesActions.updateCliente({ id: this.clienteId, dto }));
    }
  }

  private limpiarCamposOpcionalesVacios(dto: ClienteFormValue): ClienteFormValue {
    const camposOpcionales: (keyof ClienteFormValue)[] = [
      'telefono',
      'direccion',
      'fecha_nacimiento',
    ];
    const limpio = { ...dto };
    for (const campo of camposOpcionales) {
      if (limpio[campo] === '') {
        delete limpio[campo];
      }
    }
    return limpio;
  }
}
