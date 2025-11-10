import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CartService } from './cart.service';

interface JwtPayload {
  user: { userId: number };
}

@Controller('cart')
export class CartController {
  constructor(private readonly cartService: CartService) {}

  @UseGuards(JwtAuthGuard)
  @Post('checkout')
  async createOrder(
    @Req() req: JwtPayload,
    @Body()
    body: {
      products: number[];
      paymentMethod: string;
      shippingInfo?: {
        state: string;
        city: string;
        neighborhood?: string;
        zipCode: string;
        reference?: string;
      };
    },
  ) {
    const userId = req.user.userId;
    return this.cartService.createOrder(
      userId,
      body.products,
      body.shippingInfo,
    );
  }
}
