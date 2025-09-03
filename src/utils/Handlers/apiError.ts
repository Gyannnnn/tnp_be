type ValidationErrorItem = {
  param?: string;
  path?: string;
  msg: string;
};

type FieldErrors = {
  [key: string]: string[];
};

class ApiError extends Error {
  public type: string;
  public fields: FieldErrors | null;
  public statusCode: number;

  constructor(
    type: string,
    message: string,
    fields: FieldErrors | null = null,
    statusCode: number = 400
  ) {
    super(message);
    this.name = this.constructor.name;
    this.type = type;
    this.fields = fields;
    this.statusCode = statusCode;
    Error.captureStackTrace(this, this.constructor);
  }

  static validationError(
    message: string,
    validationArray: ValidationErrorItem[]
  ): ApiError {
    const fieldErrors: FieldErrors = {};

    for (const error of validationArray) {
      const field = error.param || error.path || "unknown";
      if (!fieldErrors[field]) {
        fieldErrors[field] = [];
      }
      fieldErrors[field].push(error.msg);
    }

    return new ApiError("validation", message, fieldErrors, 422);
  }

  static customFieldError(
    message: string,
    field: string,
    fieldMsg: string
  ): ApiError {
    return new ApiError("validation", message, { [field]: [fieldMsg] }, 422);
  }

  static error(
    message: string = "Internal Server Error",
    statusCode: number = 500
  ): ApiError {
    return new ApiError("server", message, null, statusCode);
  }

  static badRequest(
    message: string = "Bad Request",
    statusCode: number = 400
  ): ApiError {
    return new ApiError("bad_request", message, null, statusCode);
  }

  static unauthorized(
    message: string = "Unauthorized",
    statusCode: number = 401
  ): ApiError {
    return new ApiError("unauthorized", message, null, statusCode);
  }

  static forbidden(
    message: string = "Forbidden",
    statusCode: number = 403
  ): ApiError {
    return new ApiError("forbidden", message, null, statusCode);
  }

  static notFound(
    message: string = "Not Found",
    statusCode: number = 404
  ): ApiError {
    return new ApiError("not_found", message, null, statusCode);
  }

  static conflict(
    message: string = "Conflict",
    statusCode: number = 409
  ): ApiError {
    return new ApiError("conflict", message, null, statusCode);
  }

  static unprocessable(
    message: string = "Unprocessable Entity",
    statusCode: number = 422
  ): ApiError {
    return new ApiError("unprocessable", message, null, statusCode);
  }
}

export default ApiError;