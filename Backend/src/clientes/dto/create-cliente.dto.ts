import {
  IsDateString,
  IsEmail,
  IsNotEmpty,
  IsOptional,
  Length,
} from 'class-validator';

export class CreateClienteDto {
  @IsNotEmpty()
  @Length(10, 13)
  cedula!: string;

  @IsNotEmpty()
  @Length(1, 100)
  nombres!: string;

  @IsNotEmpty()
  @Length(1, 100)
  apellidos!: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @Length(7, 15)
  telefono?: string;

  @IsOptional()
  @Length(0, 250)
  direccion?: string;

  @IsOptional()
  @IsDateString()
  fecha_nacimiento?: string;
}
