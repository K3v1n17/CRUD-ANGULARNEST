import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Cliente } from './entities/cliente.entity';
import { CreateClienteDto } from './dto/create-cliente.dto';
import { UpdateClienteDto } from './dto/update-cliente.dto';

@Injectable()
export class ClientesService {
  constructor(
    @InjectRepository(Cliente)
    private readonly clienteRepo: Repository<Cliente>,
  ) {}

  async findAll(page = 1, limit = 10) {
    const [data, total] = await this.clienteRepo.findAndCount({
      where: { activo: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { nombres: 'ASC' },
    });

    return { data, total, page, limit };
  }

  async findOne(id: number): Promise<Cliente> {
    const cliente = await this.clienteRepo.findOne({
      where: { id, activo: true },
    });

    if (!cliente) {
      throw new NotFoundException(`Cliente #${id} no encontrado`);
    }

    return cliente;
  }

  async create(dto: CreateClienteDto): Promise<Cliente> {
    const existente = await this.clienteRepo.findOne({
      where: [{ cedula: dto.cedula }, { email: dto.email }],
    });

    if (existente) {
      throw new ConflictException(
        'Ya existe un cliente con esa cédula o email',
      );
    }

    const cliente = this.clienteRepo.create(dto);
    return this.clienteRepo.save(cliente);
  }

  async update(id: number, dto: UpdateClienteDto): Promise<Cliente> {
    const cliente = await this.findOne(id);

    if (dto.cedula || dto.email) {
      const duplicado = await this.clienteRepo.findOne({
        where: [
          ...(dto.cedula ? [{ cedula: dto.cedula }] : []),
          ...(dto.email ? [{ email: dto.email }] : []),
        ],
      });
      if (duplicado && duplicado.id !== id) {
        throw new ConflictException(
          'Ya existe un cliente con esa cédula o email',
        );
      }
    }

    Object.assign(cliente, dto, { fecha_modificacion: new Date() });
    return this.clienteRepo.save(cliente);
  }

  async remove(id: number): Promise<void> {
    // Soft-delete: nunca se ejecuta un DELETE real, para no perder el
    // historial si el cliente tiene datos relacionados en otras tablas.
    const cliente = await this.findOne(id);
    await this.clienteRepo.save({ ...cliente, activo: false });
  }
}
