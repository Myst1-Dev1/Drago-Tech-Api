/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve conter 6 ou mais caracteres' })
  password: string;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  address: string;

  @IsNotEmpty()
  zipCode: string;

  @IsNotEmpty()
  phone: string;

  @IsNotEmpty()
  city: string;

  @IsNotEmpty()
  state: string;
}
