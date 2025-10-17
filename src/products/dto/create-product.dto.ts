/* eslint-disable @typescript-eslint/no-unsafe-call */
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class TechInfoDto {
  @IsString()
  @IsNotEmpty()
  techInfoTitle: string;

  @IsString()
  @IsNotEmpty()
  techInfoValue: string;
}

export class CreateProductDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TechInfoDto)
  techInfo?: TechInfoDto[];

  @IsNumber()
  @IsNotEmpty()
  price: number;

  @IsString()
  @IsNotEmpty()
  imageUrl: string;

  @IsArray()
  @IsOptional()
  relatedImages?: string[];

  @IsBoolean()
  @IsOptional()
  isOffer?: boolean;

  @IsNumber()
  @IsOptional()
  priceOffer?: number;

  @IsBoolean()
  @IsOptional()
  popularProduct?: boolean;
}
