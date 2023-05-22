import { concatQuery } from '../concat-query'

describe('# concat query', () => {
  it('should return raw path string when query not passed in', () => {
    expect(concatQuery('foo')).toEqual('foo')
  })

  it('should return concat query string directly when query is string', () => {
    expect(concatQuery('foo', 'bar=baz')).toEqual('foo?bar=baz')
  })

  it('should not add useless question mark when query is string prefix with ?', () => {
    expect(concatQuery('foo', '?bar=baz')).toEqual('foo?bar=baz')
  })

  it('should transform correct querystring when pass an object', () => {
    expect(concatQuery('foo', { foo: 'bar', id: 2 })).toEqual('foo?foo=bar&id=2')
  })
})
