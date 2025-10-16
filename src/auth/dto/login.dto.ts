/* eslint-disable @typescript-eslint/no-unsafe-call */
import { IsEmail, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Email invalido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve conter 6 ou mais caracteres' })
  password: string;
}
