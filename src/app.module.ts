import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthModule } from './auth/auth.module';
import { CharactersModule } from './characters/characters.module';
import { LoggingInterceptor } from './common/interceptors/response-time-logger.interceptor';
import { ResponseTimeLoggerModule } from './response-time-logger/response-time-logger.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    //MongooseModule.forRoot('mongodb://root:example@mongo:27017/dnd-api?authSource=admin'),
    MongooseModule.forRoot('mongodb://0.0.0.0/books-nest'),
    AuthModule,
    UsersModule,
    CharactersModule,
    ResponseTimeLoggerModule
  ],
  controllers: [],
  providers: [
    {
      provide: APP_INTERCEPTOR,
      useClass: LoggingInterceptor,
    },
  ],
})

export class AppModule {

}
