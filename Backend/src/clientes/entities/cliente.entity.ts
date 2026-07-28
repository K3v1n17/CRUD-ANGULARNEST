import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('Clientes')
export class Cliente {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ length: 13, unique: true })
  cedula!: string;

  @Column({ length: 100 })
  nombres!: string;

  @Column({ length: 100 })
  apellidos!: string;

  @Column({ length: 150, unique: true })
  email!: string;

  @Column({ length: 15, nullable: true })
  telefono?: string;

  @Column({ length: 250, nullable: true })
  direccion?: string;

  @Column({ type: 'date', nullable: true })
  fecha_nacimiento?: string;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  fecha_creacion!: Date;

  @Column({ type: 'datetime', nullable: true })
  fecha_modificacion?: Date;
}
