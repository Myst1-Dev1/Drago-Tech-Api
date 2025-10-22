/* eslint-disable @typescript-eslint/no-redundant-type-constituents */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Delete,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
  Patch,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { FileUploadService } from '../file-upload/file-upload.service';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Public } from '../auth/public.decorator';
import { UpdateProductDto } from './dto/update-product.dto';
import { CreateCommentDto } from './dto/create-comment.dto';

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

    const uploadedMain = await this.fileUploadService.uploadImage(mainImage);

    let techInfoParsed: { techInfoTitle: string; techInfoValue: string }[] = [];
    if (createProductDto.techInfo) {
      if (typeof createProductDto.techInfo === 'string') {
        techInfoParsed = JSON.parse(createProductDto.techInfo);
      } else {
        techInfoParsed = createProductDto.techInfo;
      }
    }

    const relatedFiles = files.relatedImages || [];
    const uploadedRelated = relatedFiles.length
      ? await Promise.all(
          relatedFiles.map((file) => this.fileUploadService.uploadImage(file)),
        )
      : [];

    return this.productsService.create(
      createProductDto,
      uploadedMain.secure_url,
      uploadedRelated.map((u) => u.secure_url),
      techInfoParsed,
    );
  }

  @Patch(':id')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'image', maxCount: 1 },
      { name: 'relatedImages', maxCount: 5 },
    ]),
  )
  async update(
    @UploadedFiles()
    files: {
      image?: Express.Multer.File[];
      relatedImages?: Express.Multer.File[];
    },
    @Body() updateProductDto: UpdateProductDto,
    @Param('id') id: string,
  ) {
    const mainImage = files.image?.[0];
    let uploadedMainUrl: string | null | any = null;

    if (mainImage) {
      const uploadedMain = await this.fileUploadService.uploadImage(mainImage);
      uploadedMainUrl = uploadedMain.secure_url;
    }

    let techInfoParsed: { techInfoTitle: string; techInfoValue: string }[] = [];
    if (updateProductDto.techInfo) {
      if (typeof updateProductDto.techInfo === 'string') {
        techInfoParsed = JSON.parse(updateProductDto.techInfo);
      } else {
        techInfoParsed = updateProductDto.techInfo;
      }
    }

    const relatedFiles = files.relatedImages || [];
    const uploadedRelated = relatedFiles.length
      ? await Promise.all(
          relatedFiles.map((file) => this.fileUploadService.uploadImage(file)),
        )
      : [];

    return this.productsService.update(
      +id,
      updateProductDto,
      uploadedMainUrl,
      uploadedRelated.map((u) => u.secure_url),
      techInfoParsed,
    );
  }

  @Public()
  @Get()
  findAll() {
    return this.productsService.findAll();
  }

  @Public()
  @Get(':id')
  findById(@Param('id') id: string) {
    return this.productsService.findById(+id);
  }

  @Delete(':id')
  deleteProduct(@Param('id') id: string) {
    return this.productsService.deleteProduct(+id);
  }

  @Post('comments/:id')
  async createComment(
    @Param('id') id: string,
    @Body() createCommentDto: CreateCommentDto,
  ) {
    return this.productsService.createComment(+id, createCommentDto);
  }
}
