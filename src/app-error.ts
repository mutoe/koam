import { HttpStatus } from 'src/enums/http-status'

export default class AppError extends Error {
  status: HttpStatus
  expose: boolean = false
  detail?: JsonValue

  static handleArguments (args: any[]): {status?: HttpStatus, message?: string, detail?: JsonValue} {
    let status: HttpStatus | undefined
    let message: string | undefined
    let detail: JsonValue | undefined
    while (args.length > 0) {
      switch (typeof args[0]) {
        /* eslint-disable max-statements-per-line */
        case 'number': { status = args[0]; break }
        case 'string': { message = args[0]; break }
        default: { detail = args[0] }
        /* eslint-enable max-statements-per-line */
      }
      args = args.slice(1)
    }
    return { status, message, detail }
  }

  constructor ()
  constructor (status?: number, message?: string, detail?: JsonValue)
  constructor (status?: number, detail?: JsonValue)
  constructor (message?: string, detail?: JsonValue)
  constructor (detail?: JsonValue)
  constructor (...args: any[]) {
    const { message, status, detail } = AppError.handleArguments(args)
    super(message)
    this.status = status ?? HttpStatus.InternalServerError
    this.detail = detail
    this.expose = !!detail
  }
}
