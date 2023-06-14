import {
  ValidationPipe,
  ClassSerializerInterceptor,
  BadRequestException,
} from '@nestjs/common';
import { APP_INTERCEPTOR, APP_PIPE } from '@nestjs/core';
import { AppInterceptor } from './app.interceptor';

export const providers = [
  {
    provide: APP_PIPE,
    useFactory: () =>
      new ValidationPipe({
        transform: true,
        whitelist: true,
        exceptionFactory() {
          return new BadRequestException('Ошибка валидации запроса');
        },
      }),
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: AppInterceptor,
  },
  {
    provide: APP_INTERCEPTOR,
    useClass: ClassSerializerInterceptor,
  },
];
