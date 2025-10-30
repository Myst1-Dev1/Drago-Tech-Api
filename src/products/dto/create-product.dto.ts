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

  // ✅ Preço principal: Já está correto, converte a string para number
  @Transform(({ value }) => parseFloat(value))
  @IsNumber()
  price: number;

  @IsOptional()
  @IsString()
  imageUrl?: string;

  // ✅ TechInfo: A lógica de parsing JSON para array está correta para FormData.
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

  // 🟢 CORREÇÃO: Transforma a string de FormData ('true', 'false', 'on') em boolean nativo
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === 'on')
  @IsBoolean()
  popularProduct?: boolean;

  // 🟢 CORREÇÃO: Transforma a string de FormData ('true', 'false', 'on') em boolean nativo
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === 'on')
  @IsBoolean()
  recomendedProduct?: boolean;

  // 🟢 CORREÇÃO: Transforma a string de FormData ('true', 'false', 'on') em boolean nativo
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === 'on')
  @IsBoolean()
  isOffer?: boolean;

  // 🟢 CORREÇÃO: Lógica para tratar valor vazio (null) ou string numérica (number)
  @IsOptional()
  @Transform(({ value }) => {
    // Se a string for vazia ou nula, retorna null para o campo opcional
    if (!value || String(value).trim() === '') return null;

    // Caso contrário, tenta converter para número
    const num = parseFloat(value);
    // Verifica se a conversão foi bem-sucedida, senão retorna null
    return isNaN(num) ? null : num;
  })
  @IsNumber(
    { maxDecimalPlaces: 2 },
    { message: 'priceOffer must be a valid number' },
  )
  priceOffer?: number | null; // Tipagem ajustada para aceitar null

  @IsOptional()
  @IsArray()
  relatedImages?: string[];
}
