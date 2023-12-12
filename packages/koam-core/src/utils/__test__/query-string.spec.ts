import { parseQuery, stringifyQuery } from '../query-string'

describe('# query string', () => {
  const testcases: { qs: string, qo: any }[] = [
    { qs: '', qo: {} },
    { qs: 'foo=bar', qo: { foo: 'bar' } },
    { qs: 'foo=1&bar=false', qo: { foo: 1, bar: false } },
    { qs: 'foo=-1&bar=true', qo: { foo: -1, bar: true } },
    { qs: 'foo=0&foo=true&foo=bar', qo: { foo: [0, true, 'bar'] } },
    { qs: 'foo=0,1,bar', qo: { foo: '0,1,bar' } },
  ]

  describe('parse query', () => {
    const cases = [
      ...testcases,
      { qs: 'foo[]=0&foo[]=true&foo[]=bar', qo: { foo: [0, true, 'bar'] } },
      { qs: 'foo=0&bar=', qo: { foo: 0, bar: '' } },
      { qs: 'foo', qo: { foo: '' } },
      { qs: '=', qo: {} },
      { qs: '=a', qo: {} },
    ]
    it.each(cases)('when passed "$qs"', ({ qs, qo }) => {
      expect(parseQuery(qs)).toEqual(qo)
    })
  })

  describe('stringify query', () => {
    it.each(testcases)('should got \'$qs\'', ({ qs, qo }) => {
      expect(stringifyQuery(qo)).toEqual(qs)
    })
  })
})
