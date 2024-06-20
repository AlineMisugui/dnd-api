import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ResponseTimeLoggerController } from './response-time-logger.controller';
import { ResponseTimeLoggerService } from './response-time-logger.service';
import { ResponseTimeLogger, ResponseTimeLoggerSchema } from './schemas/response-time-logger.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: ResponseTimeLogger.name, schema: ResponseTimeLoggerSchema }]),
  ],
  controllers: [ResponseTimeLoggerController],
  providers: [ResponseTimeLoggerService],
  exports: [ResponseTimeLoggerService],
})
export class ResponseTimeLoggerModule {}
