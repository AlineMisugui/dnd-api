import { Controller, Delete, Get, Param } from '@nestjs/common';
import { ResponseTimeLoggerService } from './response-time-logger.service';

@Controller('response-time-logger')
export class ResponseTimeLoggerController {
  constructor(private readonly responseTimeLoggerService: ResponseTimeLoggerService) {}

  @Get()
  findAll() {
    return this.responseTimeLoggerService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.responseTimeLoggerService.findOne(id);
  }

  @Delete("/clear")
  clearAllLogs() {
    return this.responseTimeLoggerService.clearAllLogs();
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.responseTimeLoggerService.remove(id);
  }
}
