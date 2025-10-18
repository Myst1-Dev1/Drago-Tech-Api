import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
    imageUrl: string,
    relatedImages: string[] = [],
    techInfo: { techInfoTitle: string; techInfoValue: string }[] = [],
  ) {
    return this.prisma.product.create({
      data: {
        ...createProductDto,
        price: Number(createProductDto.price),
        imageUrl,
        relatedImages,
        techInfo,
      },
    });
  }

  async findAll() {
    return this.prisma.product.findMany();
  }
}
