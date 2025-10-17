/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Body,
  Controller,
  Post,
  UploadedFile,
  UploadedFiles,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ProductsService } from './products.service';
import { CreateProductDto } from './dto/create-product.dto';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from 'src/auth/jwt-auth.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductsController {
  constructor(readonly productsService: ProductsService) {}

  @Post()
  @UseInterceptors(
    FileFieldsInterceptor(
      [
        { name: 'imageUrl', maxCount: 1 },
        { name: 'relatedImages', maxCount: 5 },
      ],
      { dest: './uploads' },
    ),
  )
  async create(
    @Body() createProductDto: CreateProductDto,
    @UploadedFile() file: Express.Multer.File,
    @UploadedFiles() files: Express.Multer.File[],
  ): Promise<any> {
    const mainImageUrl: any = file ? file.path : null;
    const relatedImagesUrls: any = files ? files.map((f) => f.path) : [];

    console.log(mainImageUrl, relatedImagesUrls, '<< Uploaded Files');

    return this.productsService.createProduct(
      createProductDto,
      mainImageUrl,
      relatedImagesUrls,
    );
  }
}
