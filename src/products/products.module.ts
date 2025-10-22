import { Module } from '@nestjs/common';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FileUploadService } from 'src/file-upload/file-upload.service';
import { PrismaService } from '../prisma/prisma.service';

//teste 4

@Module({
  controllers: [ProductsController],
  providers: [ProductsService, FileUploadService, PrismaService],
})
export class ProductsModule {}
