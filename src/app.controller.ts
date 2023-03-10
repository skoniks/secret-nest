import {
  BadRequestException,
  Body,
  CACHE_MANAGER,
  Controller,
  ForbiddenException,
  Get,
  Inject,
  Param,
  Post,
  Put,
} from '@nestjs/common';
import { RedisCache } from 'cache-manager-ioredis-yet';
import { BinaryLike, createHash } from 'crypto';
import { AES, enc } from 'crypto-js';
import { v4, validate } from 'uuid';
import { OpenDTO } from './dto/open.dto';
import { StoreDTO } from './dto/store.dto';
import { Secret } from './types/secret';

@Controller('api')
export class AppController {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: RedisCache,
  ) {}

  @Get(':id')
  async index(@Param('id') id: string) {
    if (!validate(id)) throw new BadRequestException();
    const data = await this.cacheManager.get<string>('secrets:' + id);
    if (!data) throw new BadRequestException();
    const secret: Secret = JSON.parse(data);
    return {
      expire: new Date(secret.expire),
      passphrase: !!secret.passphrase,
    };
  }

  @Post(':id')
  async open(@Param('id') id: string, @Body() { passphrase = '' }: OpenDTO) {
    if (!validate(id)) throw new BadRequestException();
    const data = await this.cacheManager.get<string>('secrets:' + id);
    if (!data) throw new BadRequestException();
    const secret: Secret = JSON.parse(data);
    let content = secret.content;
    if (secret.passphrase) {
      if (this.md5(passphrase) !== secret.passphrase) {
        throw new ForbiddenException();
      } else {
        content = AES.decrypt(content, passphrase).toString(enc.Utf8);
      }
    }
    await this.cacheManager.del('secrets:' + id);
    return { content };
  }

  @Put()
  async store(@Body() { content, ttl, passphrase = '' }: StoreDTO) {
    if (passphrase) {
      content = AES.encrypt(content, passphrase).toString();
      passphrase = this.md5(passphrase);
    }
    const expire = Date.now() + ttl * 1000;
    const secret: Secret = { content, passphrase, expire };
    const id = v4();
    await this.cacheManager.set('secrets:' + id, JSON.stringify(secret), ttl);
    return { id, expire };
  }

  md5(data: BinaryLike) {
    return createHash('md5').update(data).digest('hex');
  }
}
