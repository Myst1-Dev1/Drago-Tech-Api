/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
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
    const booleanFields = ['isOffer', 'recomendedProduct', 'popularProduct'];

    booleanFields.forEach((field) => {
      if (createProductDto[field] !== undefined) {
        createProductDto[field] =
          createProductDto[field] === 'true' ||
          createProductDto[field] === true;
      }
    });

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
    if (!existingProduct) throw new NotFoundException('Produto não encontrado');

    const booleanFields = ['isOffer', 'recomendedProduct', 'popularProduct'];
    booleanFields.forEach((field) => {
      if (updateProductDto[field] !== undefined) {
        updateProductDto[field] =
          updateProductDto[field] === 'true' ||
          updateProductDto[field] === true;
      }
    });

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

  async toggleFavorite(userId: number, productId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: Number(userId) },
    });

    if (!user) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const favorites: number[] = Array.isArray(user.favorites)
      ? (user.favorites as number[])
      : [];

    const isFavorite = favorites.includes(productId);

    let updatedFavorites: number[];

    if (isFavorite) {
      updatedFavorites = favorites.filter((id) => id !== productId);
    } else {
      updatedFavorites = [...favorites, productId];
    }

    const updatedUser = await this.prisma.user.update({
      where: { id: userId },
      data: { favorites: updatedFavorites },
    });

    const favoriteProducts = await this.prisma.product.findMany({
      where: {
        id: {
          in: updatedFavorites,
        },
      },
      select: {
        id: true,
        name: true,
        price: true,
        imageUrl: true,
        description: true,
      },
    });

    return {
      message: isFavorite
        ? 'Produto removido dos favoritos'
        : 'Produto adicionado aos favoritos',
      user: {
        ...updatedUser,
        favorites: favoriteProducts,
      },
    };
  }
}
