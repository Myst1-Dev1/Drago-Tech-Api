import { Test, TestingModule } from '@nestjs/testing';
import { FileUploadController } from './file-upload.controller';
import { FileUploadService } from './file-upload.service';

describe('FileUploadController', () => {
  let controller: FileUploadController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [], // Se o serviço FileUploadService está em outro módulo, adicione-o aqui
      controllers: [FileUploadController],
      providers: [FileUploadService],
    }).compile();

    controller = module.get<FileUploadController>(FileUploadController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
