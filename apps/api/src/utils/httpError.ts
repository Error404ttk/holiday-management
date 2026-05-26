export enum ErrorCode {
  UNAUTHORIZED = 'UNAUTHORIZED',
  FORBIDDEN = 'FORBIDDEN',
  NOT_FOUND = 'NOT_FOUND',
  CONFLICT = 'CONFLICT',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  DATABASE_ERROR = 'DATABASE_ERROR',
  INTERNAL_ERROR = 'INTERNAL_ERROR',
  SCHEMA_MISMATCH = 'SCHEMA_MISMATCH'
}

export class HttpError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public errorCode: ErrorCode = ErrorCode.INTERNAL_ERROR
  ) {
    super(message);
    this.name = 'HttpError';
  }
}
