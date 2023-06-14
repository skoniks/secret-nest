import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
} from '@nestjs/common';
import { ApiService } from './api.service';
import { SecretIdParamDTO } from './dto/secret-id.dto';
import { SecretOpenBodyDTO } from './dto/secret-open.dto';
import { SecretStoreBodyDTO } from './dto/secret-store.dto';
import { SecretMeta } from './types/secret.types';

@Controller('api')
export class ApiController {
  constructor(private apiService: ApiService) {}

  @Get(':id')
  async indexSecret(@Param() { id }: SecretIdParamDTO) {
    if (!id) throw new BadRequestException('Тайна не найдена');
    const meta = await this.apiService.getSecretMeta(id);
    if (!meta) throw new BadRequestException('Тайна не найдена');
    const expire = new Date(meta.date + meta.ttl * 1000);
    return { expire, passphrase: !!meta.passphrase };
  }

  @Patch(':id')
  async openSecret(
    @Param() { id }: SecretIdParamDTO,
    @Body() { passphrase }: SecretOpenBodyDTO,
  ) {
    if (!id) throw new BadRequestException('Тайна не найдена');
    const meta = await this.apiService.getSecretMeta(id);
    if (!meta) throw new BadRequestException('Тайна не найдена');
    if (meta.passphrase && meta.passphrase != this.apiService.md5(passphrase)) {
      throw new ForbiddenException('Неверная фраза-пропуск');
    }
    let content = await this.apiService.getSecretContent(id);
    if (content && passphrase) {
      content = await this.apiService.decrypt(content, passphrase);
    }
    await this.apiService.delSecret(id);
    const { type, mime, filename } = meta;
    return { content, type, mime, filename };
  }

  @Post()
  async storeSecret(@Body() body: SecretStoreBodyDTO) {
    if (body.passphrase) {
      body.content = this.apiService.encrypt(body.content, body.passphrase);
      body.passphrase = this.apiService.md5(body.passphrase);
    }
    const meta: SecretMeta = {
      type: body.type,
      mime: body.mime,
      filename: body.filename,
      passphrase: body.passphrase,
      date: Date.now(),
      ttl: body.ttl,
    };
    const id = await this.apiService.getSecretIndex(body.short);
    await this.apiService.storeSecret(id, meta, body.content);
    const expire = new Date(meta.date + meta.ttl * 1000);
    return { id, expire };
  }

  // @Get('/screen/:id')
  // screen(
  //   @Param('id') id: string,
  //   @Res({ passthrough: true }) res: Response,
  // ): StreamableFile {
  //   const path = join('.', 'screens', `${id}.png`);
  //   if (!existsSync(path)) throw new NotFoundException();
  //   res.set({
  //     'Content-Type': 'image/png',
  //     'Content-Disposition': `attachment; filename="${id}.png"`,
  //   });
  //   return new StreamableFile(createReadStream(path));
  // }
}
