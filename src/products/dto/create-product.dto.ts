/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  IsString,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  IsBoolean,
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

  @IsString()
  brand: string;

  @IsString()
  category: string;

  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

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
  @IsBoolean()
  popularProduct?: boolean;

  @IsOptional()
  @IsBoolean()
  recomendedProduct?: boolean;

  @IsOptional()
  @IsBoolean()
  isOffer?: boolean;

  @IsOptional()
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  priceOffer: number;

  @IsOptional()
  @IsArray()
  relatedImages?: string[];
}
