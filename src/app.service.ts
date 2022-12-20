import { CACHE_MANAGER, Inject, Injectable } from '@nestjs/common';
import { RedisCache } from 'cache-manager-ioredis-yet';

@Injectable()
export class AppService {
  constructor(
    @Inject(CACHE_MANAGER)
    private cacheManager: RedisCache,
  ) {}

  getHello(): string {
    return 'Hello World!';
  }
}
