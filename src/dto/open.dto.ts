import { IsOptional, IsString, Length } from 'class-validator';

export class OpenDTO {
  @IsString()
  @IsOptional()
  @Length(1, 255)
  passphrase?: string;
}
