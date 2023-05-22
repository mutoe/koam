import '@mutoe/koam'

declare module '@mutoe/koam' {
  interface Context {
    params?: Record<string, string>
  }
}
