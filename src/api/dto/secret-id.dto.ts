import { Transform } from 'class-transformer';
import { IsString } from 'class-validator';

export class SecretIdParamDTO {
  @IsString()
  @Transform(({ value }) =>
    value
      .replace(/[^0-9A-Z\-]/gi, '')
      .substring(0, 36)
      .trim(),
  )
  id: string;
}
