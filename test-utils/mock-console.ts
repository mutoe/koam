/* eslint-disable no-console */

import type { Mock } from 'vitest'

interface MockedConsole {
  consoleError: Mock
  consoleInfo: Mock
  consoleWarn: Mock
  consoleDebug: Mock
  consoleLog: Mock
  log: typeof console.log
}

export async function mockConsole(fn: (console: MockedConsole) => any): Promise<void> {
  const { error, info, debug, warn, log } = console
  const consoleError = console.error = vi.fn()
  const consoleWarn = console.warn = vi.fn()
  const consoleLog = console.log = vi.fn()
  const consoleInfo = console.info = vi.fn()
  const consoleDebug = console.debug = vi.fn()
  await fn({ consoleError, consoleInfo, consoleWarn, consoleLog, consoleDebug, log })
  console.error = error
  console.info = info
  console.log = log
  console.warn = warn
  console.debug = debug
}
