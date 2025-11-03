/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(private prisma: PrismaService) {}

  async create(
    createProductDto: CreateProductDto,
    imageUrl: string,
    relatedImages: string[] = [],
    techInfo: { techInfoTitle: string; techInfoValue: string }[] = [],
  ) {
    const productData = { ...createProductDto };

    const priceOfferValue =
      productData.priceOffer === undefined ||
      isNaN(productData.priceOffer as number)
        ? null
        : Number(productData.priceOffer);

    delete productData.priceOffer;

    return this.prisma.product.create({
      data: {
        ...productData,

        price: Number(productData.price),
        priceOffer: priceOfferValue,

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

    const dataToUpdate: Prisma.ProductUpdateInput | any = {
      ...updateProductDto,
      imageUrl: imageUrl ?? existingProduct.imageUrl,
      relatedImages: relatedImages.length
        ? relatedImages
        : existingProduct.relatedImages,
      techInfo: techInfo.length ? techInfo : existingProduct.techInfo,
      price:
        updateProductDto.price === undefined || updateProductDto.price === null
          ? existingProduct.price
          : Number(updateProductDto.price),
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
    return await this.prisma.product.findMany({ include: { comments: true } });
  }

  async findById(id: number) {
    const productId = await this.prisma.product.findUnique({
      where: { id },
      include: { comments: true },
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

  async createComment(productId: number, createCommentDto: CreateCommentDto) {
    const product = await this.prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      throw new NotFoundException('Produto não encontrado');
    }

    const comment = await this.prisma.comment.create({
      data: {
        ...createCommentDto,
        product: { connect: { id: productId } },
      },
    });

    return comment;
  }
}
