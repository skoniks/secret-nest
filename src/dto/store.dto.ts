import { Type } from 'class-transformer';
import { IsInt, IsOptional, IsString, Length, Max, Min } from 'class-validator';

export class StoreDTO {
  @IsString()
  @Length(1, 1000000)
  content: string;

  @IsInt()
  @Min(300)
  @Max(604800)
  @Type(() => Number)
  ttl: number;

  @IsString()
  @IsOptional()
  @Length(0, 255)
  passphrase?: string;
}
