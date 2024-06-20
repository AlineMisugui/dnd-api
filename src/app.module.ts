import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
<<<<<<< HEAD
import { MongooseModule } from '@nestjs/mongoose';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
=======
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
>>>>>>> cdc50c6b899b793adb1fe7b2613a145f2c34f70e
import { AuthModule } from './auth/auth.module';
import { BooksModule } from './books/books.module';
import { LoggingInterceptor } from './common/interceptors/response-time-logger.interceptor';
import { LoggerMiddleware } from './common/middlewares/logger.middleware';
import { ProductPriceMiddleware } from './products/middlewares/productPrice.middleware';
import { ProductsModule } from './products/products.module';
import { ResponseTimeLoggerModule } from './response-time-logger/response-time-logger.module';
import { UsersModule } from './users/users.module';
import { CharactersModule } from './characters/characters.module';

@Module({
  imports: [
    // MongooseModule.forRoot('mongodb://root:example@mongo:27017/dnd-api?authSource=admin'),
    MongooseModule.forRoot('mongodb://0.0.0.0/books-nest'),
    AuthModule,
    UsersModule,
<<<<<<< HEAD
    CharactersModule,
=======
    ResponseTimeLoggerModule,
>>>>>>> cdc50c6b899b793adb1fe7b2613a145f2c34f70e
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})

export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('cats');
  }
}
