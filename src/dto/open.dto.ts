import { IsOptional, IsString, Length } from 'class-validator';

export class OpenDTO {
  @IsString()
  @IsOptional()
  @Length(0, 255)
  passphrase?: string;
}
