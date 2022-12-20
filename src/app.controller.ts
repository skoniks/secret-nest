import {
  CACHE_MANAGER,
  Controller,
  Get,
  Inject,
  Param,
  Post,
  Put,
  NotFoundException,
  ForbiddenException,
  Body,
} from '@nestjs/common';
import { RedisCache } from 'cache-manager-ioredis-yet';
import { BinaryLike, createHash } from 'crypto';
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
    if (!validate(id)) throw new NotFoundException();
    const data = await this.cacheManager.get<string>('secrets:' + id);
    if (!data) throw new NotFoundException();
    const secret: Secret = JSON.parse(data);
    return {
      expire: new Date(secret.expire),
      passphrase: !!secret.passphrase,
    };
  }

  @Post(':id')
  async open(@Param('id') id: string, @Body() { passphrase }: OpenDTO) {
    if (!validate(id)) throw new NotFoundException();
    const data = await this.cacheManager.get<string>('secrets:' + id);
    if (!data) throw new NotFoundException();
    const secret: Secret = JSON.parse(data);
    if (secret.passphrase && this.md5(passphrase || '') !== secret.passphrase)
      throw new ForbiddenException();
    await this.cacheManager.del('secrets:' + id);
    return { content: secret.content };
  }

  @Put()
  async store(@Body() { content, ttl, passphrase }: StoreDTO) {
    const secret: Secret = {
      content,
      passphrase: passphrase ? this.md5(passphrase) : '',
      expire: Date.now() + ttl * 1000,
    };
    const id = v4();
    await this.cacheManager.set('secrets:' + id, JSON.stringify(secret), ttl);
    return { id, expire: secret.expire };
  }

  md5(data: BinaryLike) {
    return createHash('md5').update(data).digest('hex');
  }
}
