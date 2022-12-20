import { IsOptional, IsString } from 'class-validator';

export class OpenDTO {
  @IsString()
  @IsOptional()
  passphrase?: string;
}
