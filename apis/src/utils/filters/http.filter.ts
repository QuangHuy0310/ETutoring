import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import Logger from '@utils/configs/logger';
import { pick } from 'ramda';
import { Logger as ILogger } from 'winston';

@Catch()
export class HttpErrorFilter implements ExceptionFilter {
  private readonly logger: ILogger;

  constructor() {
    this.logger = Logger;
  }

  catch(exception, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const request = ctx.getRequest();
    const response = ctx.getResponse();

    const statusCode =
      exception instanceof HttpException
        ? exception.getStatus()
        : HttpStatus.INTERNAL_SERVER_ERROR;

    const ErrorResponse = {
      statusCode,
      timestamp: new Date().toISOString(),
      path: request.url,
      ...pick(['body', 'query', 'params', 'role', 'method'], request),
      errorName: exception?.name,
      message: exception?.response?.message || exception?.message,
      data: exception?.response?.data || exception?.data,
      errorCode: exception?.response?.errorCode || exception?.errorCode,
    };

    this.logger.error(`${JSON.stringify(ErrorResponse, null, '\t')}`);

    response.status(statusCode).json(ErrorResponse);
  }
}
