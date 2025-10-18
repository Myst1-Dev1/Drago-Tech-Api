/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Post,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Public } from 'src/auth/public.decorator';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(
    readonly productsService: ProductsService,
    readonly fileUploadService: FileUploadService,
  ) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'relatedImages', maxCount: 5 },
    ]),
  )
  async create(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      relatedImages?: Express.Multer.File[];
    },
    @Body() createProductDto: CreateProductDto,
  ) {
    const mainImage = files.image?.[0];
    if (!mainImage) {
      throw new BadRequestException('Main image is required');
    }

    // 🔹 Upload da imagem principal
    const uploadedMain = await this.fileUploadService.uploadImage(mainImage);

    // 🔹 Parse do techInfo
    let techInfoParsed: { techInfoTitle: string; techInfoValue: string }[] = [];
    if (createProductDto.techInfo) {
      if (typeof createProductDto.techInfo === 'string') {
        techInfoParsed = JSON.parse(createProductDto.techInfo);
      } else {
        techInfoParsed = createProductDto.techInfo;
      }
    }

    // 🔹 Upload das imagens relacionadas
    const relatedFiles = files.relatedImages || [];
    const uploadedRelated = relatedFiles.length
      ? await Promise.all(
          relatedFiles.map((file) => this.fileUploadService.uploadImage(file)),
        )
      : [];

    // 🔹 Cria o produto
    return this.productsService.create(
      createProductDto,
      uploadedMain.secure_url,
      uploadedRelated.map((u) => u.secure_url),
      techInfoParsed,
    );
  }

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }
}
