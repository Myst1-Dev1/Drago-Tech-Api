import { Injectable } from '@nestjs/common';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProductDto } from './dto/create-product.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class ProductsService {
  constructor(
    private prisma: PrismaService,
    private fileUpload: FileUploadService,
  ) {}

  async createProduct(
    createProductDto: CreateProductDto,
    file?: Express.Multer.File,
    files?: Express.Multer.File[],
  ) {
    let mainImageUrl = createProductDto.imageUrl ?? null;
    if (file) {
      const uploadedMain = await this.fileUpload.uploadImage(file);
      mainImageUrl = uploadedMain.secure_url;
    }

    let relatedImages: string[] = [];

    if (files && files.length > 0) {
      const uploadResults = await Promise.all(
        files.map((f) => this.fileUpload.uploadImage(f)),
      );
      relatedImages = uploadResults.map((r) => r.secure_url);
    } else if (
      createProductDto.relatedImages &&
      createProductDto.relatedImages.length
    ) {
      relatedImages = createProductDto.relatedImages;
    }

    const techInfo =
      createProductDto.techInfo?.map((item) => ({
        techInfoTitle: item.techInfoTitle,
        techInfoValue: item.techInfoValue,
      })) ?? Prisma.JsonNull;

    const product = await this.prisma.product.create({
      data: {
        ...createProductDto,
        imageUrl: mainImageUrl,
        relatedImages,
        techInfo,
      },
    });

    return product;
  }
}
