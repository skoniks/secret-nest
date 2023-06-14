import { Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsString,
  Length,
  Max,
  Min,
  ValidateIf,
} from 'class-validator';
import { SecretType, secretTypes } from '../types/secret.types';

export class SecretStoreBodyDTO {
  @IsString()
  @Length(1, 1000000)
  content: string;

  @IsIn(secretTypes)
  type: SecretType;

  @ValidateIf((i) => i.type != 'text')
  @IsString()
  @Length(0, 255)
  mime?: string;

  @ValidateIf((i) => i.type == 'file')
  @IsString()
  @Length(0, 255)
  filename?: string;

  @IsString()
  @Length(0, 255)
  passphrase = '';

  @IsBoolean()
  @Type(() => Boolean)
  short: boolean;

  @IsInt()
  @Min(300)
  @Max(604800)
  @Type(() => Number)
  ttl: number;
}
