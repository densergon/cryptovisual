import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

interface ProblemDetails {
  type: string;
  title: string;
  status: number;
  detail: string;
  instance: string;
  timestamp: string;
  errors?: Record<string, string[]>;
}

interface ExceptionBody {
  message: string | string[];
  error?: string;
  statusCode?: number;
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let title = 'Internal Server Error';
    let detail = 'An unexpected error occurred';
    let errors: Record<string, string[]> | undefined;

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const body = exception.getResponse() as ExceptionBody;

      title = body.error ?? exception.message;
      detail =
        typeof body.message === 'string' ? body.message : exception.message;

      if (Array.isArray(body.message)) {
        errors = { validation: body.message };
        detail = 'Validation failed';
      }
    } else if (exception instanceof Error) {
      detail = exception.message;
    }

    const problem: ProblemDetails = {
      type: `https://httpstatuses.org/${status}`,
      title,
      status,
      detail,
      instance: request.url,
      timestamp: new Date().toISOString(),
      errors,
    };

    response.status(status).json(problem);
  }
}
