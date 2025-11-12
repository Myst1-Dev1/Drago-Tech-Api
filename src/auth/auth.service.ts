/* eslint-disable @typescript-eslint/no-unused-vars */

import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { RegisterDto } from './dto/register.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto) {
    const { email, password, name, address, zipCode, state, city, phone } =
      registerDto;

    const existingUser = await this.prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      throw new ConflictException(
        'Usuário já existe! Por favor insira outro email',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        address,
        zipCode,
        state,
        city,
        phone,
        favorites: [],
        orders: [],
      },
    });

    const { password: _, ...result } = newUser;
    return result;
  }

  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Credenciais inválidas! Por favor tente novamente.',
      );
    }

    const passwordValid = await bcrypt.compare(password, user.password);

    if (!passwordValid) {
      throw new UnauthorizedException(
        'Credenciais inválidas! Por favor tente novamente.',
      );
    }

    const token = this.jwtService.sign({ userId: user.id });

    const { password: _, ...result } = user;

    return { ...result, token };
  }

  async getUser(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) throw new NotFoundException('Usuário não encontrado');

    const favoriteIds = Array.isArray(user.favorites)
      ? (user.favorites as number[])
      : [];

    const favoriteProducts = await this.prisma.product.findMany({
      where: {
        id: { in: favoriteIds },
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        description: true,
      },
    });

    const { password, ...userWithoutPassword } = user;

    return {
      ...userWithoutPassword,
      favorites: favoriteProducts,
    };
  }
}
