export function intersection<T>(a: T[], b: T[]): T[] {
  const set = new Set(a)
  return Array.from(set).filter(x => b.includes(x))
}
