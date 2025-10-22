import { Test, TestingModule } from '@nestjs/testing';
import { ProductsController } from './products.controller';
import { ProductsService } from './products.service';
import { FileUploadService } from '../file-upload/file-upload.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ProductsController', () => {
  let controller: ProductsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [], // Se o ProductsService depende de um módulo, adicione-o aqui
      controllers: [ProductsController],
      providers: [ProductsService, PrismaService, FileUploadService],
    }).compile();

    controller = module.get<ProductsController>(ProductsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
