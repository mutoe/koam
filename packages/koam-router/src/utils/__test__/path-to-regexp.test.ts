import { PathRegexp } from '../path-to-regexp'

describe('# Path RegExp', () => {
  it('should got regular expression instance', () => {
    const result = new PathRegexp('/foo')
    expect(result).toBeInstanceOf(RegExp)
    expect(result.path).toEqual('/foo')
    expect(result.source).toEqual('^\\/?foo\\/?$')
  })

  describe('path test', () => {
    describe('when path is "/foo"', () => {
      it.each([
        { s: '/foo', expected: true },
        { s: 'foo', expected: true },
        { s: '//foo', expected: false },
        { s: '/foo-', expected: false },
        { s: '-foo', expected: false },
        { s: '/fo', expected: false },
        { s: '/b', expected: false },
      ])('when test string is "$s" expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo').test(s)

        expect(result).toEqual(expected)
      })
    })

    describe('when path is "/foo/:bar"', () => {
      it.each([
        { s: '/foo/hello', expected: true },
        { s: '/foo/hello-world', expected: true },
        { s: 'foo/hello', expected: true },

        { s: '/foo', expected: false },
        { s: '/foo/hello/world', expected: false },
        { s: '/fo/hello', expected: false },
        { s: '/b', expected: false },
      ])('when test string is "$s" expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo/:bar').test(s)

        expect(result).toEqual(expected)
      })
    })

    describe('when path is "/foo/:bar/baz"', () => {
      it.each([
        { s: '/foo/hello/baz', expected: true },
        { s: 'foo/hello/baz/', expected: true },

        { s: '/foo/hello-world', expected: false },
        { s: '/foo', expected: false },
        { s: '/foo/hello/world', expected: false },
        { s: '/fo/hello', expected: false },
        { s: '/b', expected: false },
      ])('when test string is "$s" expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo/:bar/baz').test(s)

        expect(result).toEqual(expected)
      })
    })
  })

  describe('named group', () => {
    describe('when path is "/:foo/:bar"', () => {
      it.each([
        { s: '/hello/world', expected: { foo: 'hello', bar: 'world' } },

        { s: '/hello/', expected: undefined },
        { s: '/hello/world/abc', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/:foo/:bar').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })

    describe('when path is "/foo-:bar"', () => {
      it.each([
        { s: '/foo-world', expected: { bar: 'world' } },
        { s: '/foo-1', expected: { bar: '1' } },
        { s: '/foo-1-2', expected: { bar: '1-2' } },

        { s: '/fo-world', expected: undefined },
        { s: '/foo', expected: undefined },
        { s: '/foo-', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo-:bar').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })

    describe('when path is "/:foo-:bar"', () => {
      it.each([
        { s: '/hello-world', expected: { foo: 'hello', bar: 'world' } },
        { s: '/foo-1', expected: { foo: 'foo', bar: '1' } },
        { s: '/foo-1-2', expected: { foo: 'foo', bar: '1-2' } },

        { s: '/foo', expected: undefined },
        { s: '/foo-', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/:foo-:bar').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })

    describe('when path is "/:foo/:bar?"', () => {
      it.each([
        { s: '/hello/world', expected: { foo: 'hello', bar: 'world' } },
        { s: '/hello/', expected: { foo: 'hello' } },

        { s: '/hello/world/abc', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/:foo/:bar?').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })

    describe('when path is "/:foo/:bar?/baz"', () => {
      it.each([
        { s: '/hello/world/baz', expected: { foo: 'hello', bar: 'world' } },
        { s: '/hello/baz', expected: { foo: 'hello' } },

        { s: '/hello/baa', expected: undefined },
        { s: '/hello/world/abc', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/:foo/:bar?/baz').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })
  })
})
