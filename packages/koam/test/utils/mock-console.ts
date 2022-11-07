// eslint-disable-next-line @typescript-eslint/ban-types

interface MockedConsole {
  consoleError: jest.Mock
  consoleInfo: jest.Mock
  consoleWarn: jest.Mock
  consoleDebug: jest.Mock
  consoleLog: jest.Mock
  log: typeof console.log
}

export const mockConsole = async (fn: (console: MockedConsole) => any): Promise<void> => {
  const { error, info, debug, warn, log } = console
  const consoleError = console.error = jest.fn()
  const consoleWarn = console.warn = jest.fn()
  const consoleLog = console.log = jest.fn()
  const consoleInfo = console.info = jest.fn()
  const consoleDebug = console.debug = jest.fn()
  await fn({ consoleError, consoleInfo, consoleWarn, consoleLog, consoleDebug, log })
  console.error = error
  console.info = info
  console.log = log
  console.warn = warn
  console.debug = debug
}
