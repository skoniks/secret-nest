import { IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class StoreDTO {
  @IsString()
  content: string;

  @IsInt()
  @Min(300)
  @Max(604800)
  ttl: number;

  @IsString()
  @IsOptional()
  passphrase?: string;
}
