import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor
} from "@nestjs/common";
import { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { CreateResponseTimeLoggerDto } from "src/response-time-logger/dto/create-response-time-logger.dto";
import { ResponseTimeLoggerService } from "src/response-time-logger/response-time-logger.service";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(private readonly responseTimeLoggerService: ResponseTimeLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const routeName = request.url;
    const method = request.method;
    const now = Date.now();

    return next.handle().pipe(
      tap(async () => {
        const responseStatus = context.switchToHttp().getResponse().statusCode;
        const newResponseTimeLogger: CreateResponseTimeLoggerDto = {
          route: routeName,
          method: method,
          responseTimeMiliseconds: Date.now() - now,
          statusCode: responseStatus,
        }
        await this.responseTimeLoggerService.create(newResponseTimeLogger);
      })
    );
  }
}
