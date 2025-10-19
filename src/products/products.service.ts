/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';

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

  async update(
    id: number,
    updateProductDto: UpdateProductDto,
    imageUrl?: string | null,
    relatedImages: string[] = [],
    techInfo: { techInfoTitle: string; techInfoValue: string }[] = [],
  ) {
    const existingProduct = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!existingProduct) {
      throw new NotFoundException('Produto não encontrado');
    }

    const dataToUpdate: any = {
      ...updateProductDto,
      imageUrl: imageUrl ?? existingProduct.imageUrl,
      relatedImages: relatedImages.length
        ? relatedImages
        : existingProduct.relatedImages,
      techInfo: techInfo.length ? techInfo : existingProduct.techInfo,
    };

    if (
      updateProductDto.price === undefined ||
      updateProductDto.price === null
    ) {
      dataToUpdate.price = existingProduct.price;
    } else {
      dataToUpdate.price = Number(updateProductDto.price);
    }

    return this.prisma.product.update({
      where: { id },
      data: dataToUpdate,
    });
  }

  async findAll() {
    return await this.prisma.product.findMany();
  }

  async findById(id: number) {
    const productId = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productId) {
      throw new NotFoundException('Produto não encontado');
    }

    return productId;
  }

  async deleteProduct(id: number) {
    const productId = await this.prisma.product.findUnique({
      where: { id },
    });

    if (!productId) {
      throw new NotFoundException('Produto não encontado');
    }

    return await this.prisma.product.delete({
      where: { id },
    });
  }
}
