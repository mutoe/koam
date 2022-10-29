import { parseQuery } from 'src/utils/query-string'

describe('# query string', () => {
  describe('parse query', () => {
    const testcases: {qs: string, expected: any}[] = [
      { qs: '', expected: {} },
      { qs: 'foo=bar', expected: { foo: 'bar' } },
      { qs: 'foo=1&bar=false', expected: { foo: 1, bar: false } },
      { qs: 'foo=-1&bar=true', expected: { foo: -1, bar: true } },
      { qs: 'foo=0&bar=', expected: { foo: 0, bar: '' } },
      // TODO: query string parse array format
      // { qs: 'foo=0&foo=true&foo=bar', expected: { foo: [0, true, 'bar'] } },
      // { qs: 'foo[]=0&foo[]=true&foo[]=bar', expected: { foo: [0, true, 'bar'] } },
      { qs: 'foo=0,1,bar', expected: { foo: '0,1,bar' } },
      { qs: 'foo', expected: { foo: '' } },
      // TODO: fix side path case
      // { qs: '=', expected: {} },
      // { qs: '=a', expected: {} },
    ]

    it.each(testcases)('should return object correctly when passed "$qs"', ({ qs, expected }) => {
      expect(parseQuery(qs)).toEqual(expected)
    })
  })
})
