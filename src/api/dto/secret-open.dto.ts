import { IsString, Length } from 'class-validator';

export class SecretOpenBodyDTO {
  @IsString()
  @Length(0, 255)
  passphrase = '';
}
