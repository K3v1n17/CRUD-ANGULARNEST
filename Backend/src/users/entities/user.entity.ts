import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from 'typeorm';

@Entity('usuarios')
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ unique: true })
  email!: string;

  @Column()
  password_hash!: string;

  @Column()
  nombre!: string;

  @Column({ default: true })
  activo!: boolean;

  @CreateDateColumn()
  fecha_creacion!: Date;
}
