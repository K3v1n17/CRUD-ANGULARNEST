import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';

const SALT_ROUNDS = 10;

interface CreateUserInput {
  email: string;
  password: string;
  nombre: string;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.userRepository.findOne({ where: { email } });
  }

  async findById(id: number): Promise<User | null> {
    return this.userRepository.findOne({ where: { id } });
  }

  async create(data: CreateUserInput): Promise<User> {
    const password_hash = await bcrypt.hash(data.password, SALT_ROUNDS);
    const user = this.userRepository.create({
      email: data.email,
      password_hash,
      nombre: data.nombre,
    });
    return this.userRepository.save(user);
  }
}
