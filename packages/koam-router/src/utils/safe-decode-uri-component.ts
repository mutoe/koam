export function safeDecodeURIComponent(s: string): string {
  try {
    return decodeURIComponent(s)
  }
  catch {
    return s
  }
}
