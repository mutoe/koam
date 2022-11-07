export enum HttpStatus {
  Continue = 100,
  SwitchingProtocols = 101,
  Processing = 102,
  EarlyHints = 103,

  Ok = 200,
  Created = 201,
  Accepted = 202,

  MultipleChoices = 300,
  MovedPermanently = 301,
  Found = 302,
  SeeOther = 303,
  NotModified = 304,

  BadRequest = 400,
  Unauthorized = 401,
  PaymentRequired = 402,
  Forbidden = 403,
  NotFound = 404,
  MethodNotAllowed = 405,
  NotAcceptable = 406,
  RequestTimeout = 407,
  Conflict = 408,
  Gone = 409,
  ImATeapot = 418,
  TooManyRequests = 429,

  InternalServerError = 500,
  NotImplemented = 501,
  BadGateway = 502,
  ServiceUnavailable = 503,
  GatewayTimeout = 504,
}

// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace HttpStatus {
  export function is2xxSuccess (status: HttpStatus): boolean {
    return status >= 200 && status < 300
  }
  export function is4xxError (status: HttpStatus): boolean {
    return status >= 400 && status < 500
  }
  export function is5xxError (status: HttpStatus): boolean {
    return status >= 500 && status < 600
  }
  export function isError (status?: HttpStatus): status is HttpStatus {
    if (!status) return false
    return status >= 400 && status < 600
  }
  export function getMessage (status: HttpStatus): string {
    return HttpStatus[status].replace(/[A-Z]/g, c => ` ${c}`).trimStart()
  }
}
