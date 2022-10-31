// eslint-disable-next-line @typescript-eslint/ban-types
export const mockConsoleError = async (fn: (mockError: jest.Mock) => any): Promise<void> => {
  const { error } = console
  const mockError = jest.fn()
  console.error = mockError
  await fn(mockError)
  console.error = error
}
