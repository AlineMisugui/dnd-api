import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { NotFoundException } from '../common/exceptions/not-found.exception';
import { CreateResponseTimeLoggerDto } from './dto/create-response-time-logger.dto';
import { ResponseTimeLogger } from './schemas/response-time-logger.schema';

@Injectable()
export class ResponseTimeLoggerService {
  constructor(@InjectModel(ResponseTimeLogger.name) private responseTimeLoggerModel: Model<ResponseTimeLogger>) { }

  async create(createResponseTimeLoggerDto: CreateResponseTimeLoggerDto) {
    const createdResponseTimeLogger = await this.responseTimeLoggerModel.create(createResponseTimeLoggerDto);
    return createdResponseTimeLogger;
  }

  async findAll() {
    return await this.responseTimeLoggerModel.find();
  }

  async findOne(id: string) {
    const logFound = await this.responseTimeLoggerModel.findById(id);
    if (!logFound) {
      throw new NotFoundException('Log not found');
    }
    return logFound;
  }

  async remove(id: string) {
    const logFound = await this.findOne(id);
    return await logFound.deleteOne({ _id: id });
  }

  async clearAllLogs() {
    return await this.responseTimeLoggerModel.deleteMany({});
  }
}
