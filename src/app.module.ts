import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ApiModule } from './api/api.module';
import { providers } from './app.provide';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [ConfigModule.forRoot(), StorageModule, ApiModule],
  providers,
})
export class AppModule {}
