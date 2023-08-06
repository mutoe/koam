import '@mutoe/koam-core'
import type { Logger } from './logger'

declare module '@mutoe/koam-core' {
  interface Context {
    /**
     * A logger that logs information and errors using a logger.
     *
     * This log method will print context information by default. If you don't want to print context information, you can use the native `logger` method.
     */
    log: {
      (...args: any[]): void
      error: (...args: any[]) => void
      warn: (...args: any[]) => void
      info: (...args: any[]) => void
      debug: (...args: any[]) => void
    }

    /**
     * A logger that logs information and errors using a logger.
     *
     * This logger will not print context information by default. If you want to print context information, you can use the native `log` method.
     */
    logger: Logger
  }
}

export {}
