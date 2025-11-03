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
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === 'on';
    }
    return false;
  })
  @IsBoolean()
  popularProduct?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === 'on';
    }
    return false;
  })
  @IsBoolean()
  recomendedProduct?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'boolean') return value;
    if (typeof value === 'string') {
      return value.toLowerCase() === 'true' || value === 'on';
    }
    return false;
  })
  @IsBoolean()
  isOffer?: boolean;

  @IsOptional()
  @Transform(({ value }) => {
    if (!value || String(value).trim() === '') return null;

    const num = parseFloat(value);
    return isNaN(num) ? null : num;
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'priceOffer must be a valid number' },
  )
  priceOffer?: number | null;

  @IsOptional()
  @IsArray()
  relatedImages?: string[];
}
