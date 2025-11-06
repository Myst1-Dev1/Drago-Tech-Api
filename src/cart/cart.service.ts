/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async createOrder(
    userId: number,
    productIds: number[],
    shippingInfo?: {
      state: string;
      city: string;
      neighborhood?: string;
      zipCode: string;
      reference?: string;
    },
  ) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const products = await this.prisma.product.findMany({
      where: { id: { in: productIds } },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
      },
    });

    if (products.length === 0) {
      throw new BadRequestException('Nenhum produto válido encontrado');
    }

    const total = products.reduce((acc, p) => acc + p.price, 0);

    const paymentApproved = true;
    if (!paymentApproved) {
      throw new BadRequestException('Pagamento não aprovado');
    }

    const newOrder = {
      id: Date.now(),
      items: products,
      total,
      date: new Date().toISOString(),
      shippingInfo: shippingInfo || {
        state: user.state,
        city: user.city,
        zipCode: user.zipCode,
        neighborhood: '',
        reference: '',
      },
    };

    const updatedOrders = Array.isArray(user.orders)
      ? [...user.orders, newOrder]
      : [newOrder];

    await this.prisma.user.update({
      where: { id: userId },
      data: { orders: updatedOrders as any },
    });

    return {
      message: 'Pedido criado com sucesso!',
      order: newOrder,
    };
  }
}
