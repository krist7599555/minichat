import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response, Request } from 'express';

@Catch()
export class BaseErrorFilter implements ExceptionFilter {
  catch(exception: Error, host: ArgumentsHost) {
    console.error(exception)
    const ctx      = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request  = ctx.getRequest<Request>();
    const status   =
    exception instanceof HttpException
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    response.status(status).json({
      code:      status,
      path:      request.url,
      timestamp: new Date().getTime() / 1000,
      message:   exception.message,
    });
  }
}