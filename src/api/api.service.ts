import { Injectable } from '@nestjs/common';
import { createHash } from 'crypto';
import { AES, enc } from 'crypto-js';
import { StorageService } from 'src/storage/storage.service';
import { v4 } from 'uuid';
import { SecretMeta } from './types/secret.types';

@Injectable()
export class ApiService {
  constructor(private storage: StorageService) {}

  async getSecretMeta(id: string): Promise<SecretMeta | undefined> {
    const meta = await this.storage.hget(`secret:${id}`, 'meta');
    if (meta) return <SecretMeta>JSON.parse(meta);
    return undefined;
  }

  getSecretContent(id: string): Promise<string | null> {
    return this.storage.hget(`secret:${id}`, 'content');
  }

  async storeSecret(id: string, meta: SecretMeta, content: string) {
    await this.storage.hset(`secret:${id}`, {
      meta: JSON.stringify(meta),
      content,
    });
    await this.storage.expire(`secret:${id}`, meta.ttl);
  }

  async getSecretIndex(short: boolean): Promise<string> {
    if (!short) return v4();
    const index = await this.storage.get('index');
    const next = (parseInt(index ?? '') || 0) + 1;
    await this.storage.set('index', next);
    return next.toString(36);
  }

  delSecret(id: string): Promise<number> {
    return this.storage.del(`secret:${id}`);
  }

  encrypt(data: string, key: string): string {
    return AES.encrypt(data, key).toString();
  }

  decrypt(data: string, key: string): string {
    return AES.decrypt(data, key).toString(enc.Utf8);
  }

  md5(data: string): string {
    return createHash('md5').update(data).digest('hex');
  }
}
