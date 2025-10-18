/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type, Transform } from 'class-transformer';

class TechInfoItem {
  @IsString()
  techInfoTitle: string;

  @IsString()
  techInfoValue: string;
}

export class CreateProductDto {
  @IsString()
  name: string;

  @IsString()
  description: string;

  // 🔹 Converte "90" (string) → 90 (number)
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  // 🔹 Faz o parse automático do JSON vindo como string
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechInfoItem)
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      try {
        return JSON.parse(value);
      } catch {
        return [];
      }
    }
    return value;
  })
  techInfo?: TechInfoItem[];

  @IsOptional()
  @IsArray()
  relatedImages?: string[];
}
