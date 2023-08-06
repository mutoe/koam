import { existsSync } from 'node:fs'
import { appendFile, mkdir } from 'node:fs/promises'
import { resolve } from 'node:path'
import { dateFormat } from './utils/date-format'

/** Log level. priority: Debug < Info < Log < Warn < Error */
export type LogLevel =
    | 'debug'
    | 'info'
    | 'log'
    | 'warn'
    | 'error'
    | 'silent'
export const logLevels = ['debug', 'info', 'log', 'warn', 'error', 'silent'] as const

interface ConsoleDriver {
  type: 'console'
}
interface FileDriver {
  type: 'file'
  /** log file directory (absolute path) */
  dir: string
  /**
   * log file name
   * @default 'output.log'
   */
  filename?: string
  /**
   * log file name (only error log)
   * @default 'output.log'
   */
  errorFilename?: string
}

type LogDriver = ConsoleDriver | FileDriver

export interface LoggerOptions {
  level?: LogLevel
  moduleName?: string
  drivers?: LogDriver[]
  datetimeFormat?: string
}

export class Logger {
  moduleName: string | undefined
  level: LogLevel = 'log'
  drivers: LogDriver[] = [{ type: 'console' }]
  datetimeFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ'

  private get consoleDriver () { return this.drivers.find(it => it.type === 'console') as ConsoleDriver | undefined }
  private get fileDriver () { return this.drivers.find(it => it.type === 'file') as FileDriver | undefined }

  constructor (options?: LoggerOptions)
  constructor (moduleName?: string, options?: LoggerOptions)
  constructor (moduleNameOrOptions?: string | LoggerOptions, options?: LoggerOptions) {
    let moduleName: string | undefined
    if (typeof moduleNameOrOptions === 'string') {
      moduleName = moduleNameOrOptions
    } else {
      options = moduleNameOrOptions
      moduleName = moduleNameOrOptions?.moduleName
    }

    if (moduleName) this.moduleName = moduleName
    if (options?.level) this.level = options.level
    if (options?.drivers) this.drivers = options.drivers
    if (options?.datetimeFormat) this.datetimeFormat = options.datetimeFormat
  }

  private readonly logLevelPriority = { debug: 0, info: 1, log: 2, warn: 3, error: 4, silent: 5 }
  private shouldLogAtLevel (level: LogLevel): boolean {
    return this.logLevelPriority[level] >= this.logLevelPriority[this.level]
  }

  private async writeFileLog (level: LogLevel, ...args: any[]) {
    if (!this.fileDriver) return
    if (!this.shouldLogAtLevel(level)) return

    const filename = (level === 'error' ? this.fileDriver.errorFilename || this.fileDriver.filename : this.fileDriver.filename) || 'output.log'
    if (this.datetimeFormat) args.unshift(dateFormat(new Date(), this.datetimeFormat))

    if (!existsSync(this.fileDriver.dir)) await mkdir(this.fileDriver.dir, { recursive: true })

    const log = `${args.join(' ')}\n`
    // If file not exist, create it
    await appendFile(resolve(this.fileDriver.dir, filename), log, { flag: 'a' })
  }

  log (...args: any[]): void {
    if (!this.shouldLogAtLevel('log')) return
    if (this.moduleName) args.unshift(`[${this.moduleName}]`)
    args.unshift('[LOG]')

    if (this.consoleDriver) console.log(...args)
    if (this.fileDriver) void this.writeFileLog('log', ...args)
  }

  debug (...args: any[]): void {
    if (!this.shouldLogAtLevel('debug')) return
    if (this.moduleName) args.unshift(`[${this.moduleName}]`)
    args.unshift('[DEBUG]')

    if (this.consoleDriver) console.debug(...args)
    if (this.fileDriver) void this.writeFileLog('debug', ...args)
  }

  info (...args: any[]): void {
    if (!this.shouldLogAtLevel('info')) return
    if (this.moduleName) args.unshift(`[${this.moduleName}]`)
    args.unshift('[INFO]')

    if (this.consoleDriver) console.info(...args)
    if (this.fileDriver) void this.writeFileLog('info', ...args)
  }

  warn (...args: any[]): void {
    if (!this.shouldLogAtLevel('warn')) return
    if (this.moduleName) args.unshift(`[${this.moduleName}]`)
    args.unshift('[WARN]')

    if (this.consoleDriver) console.warn(...args)
    if (this.fileDriver) void this.writeFileLog('warn', ...args)
  }

  error (...args: any[]): void {
    if (!this.shouldLogAtLevel('error')) return
    if (this.moduleName) args.unshift(`[${this.moduleName}]`)
    args.unshift('[ERROR]')

    if (this.consoleDriver) console.error(...args)
    if (this.fileDriver) void this.writeFileLog('error', ...args)
  }
}
