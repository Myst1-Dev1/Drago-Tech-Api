/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
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

    const paymentPayload = {
      userId,
      total,
      products,
      shippingInfo: shippingInfo || {
        state: user.state,
        city: user.city,
        zipCode: user.zipCode,
        neighborhood: user.address,
        reference: '',
      },
    };

    const paymentResponse = await fetch(process.env.N8N_WEBHOOK_URL!, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(paymentPayload),
    });

    let data: any;

    try {
      data = await paymentResponse.json();
    } catch (e) {
      throw new BadRequestException(
        'Erro ao interpretar retorno do N8N. O JSON veio vazio / mal formatado.',
      );
    }

    if (!data?.status || !data?.transactionId) {
      throw new BadRequestException(
        `Retorno inválido do N8N. Esperado: { status: "approved", transactionId: "123" }`,
      );
    }

    const newOrder = {
      id: Date.now(),
      items: products,
      total,
      date: new Date().toISOString(),
      shippingInfo: paymentPayload.shippingInfo,
      transactionId: data.transactionId,
    };

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        orders: [...(user.orders as any[]), newOrder],
      },
    });

    return {
      message: 'Pedido criado com sucesso!',
      order: newOrder,
    };
  }
}
