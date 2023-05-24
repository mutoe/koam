import { PathRegexp } from '../path-regexp'

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

    describe('when path is "/foo.png"', () => {
      it.each([
        { s: '/foo.png', expected: true },

        { s: '/foo-png', expected: false },
        { s: 'foo', expected: false },
        { s: '//foo.png', expected: false },
        { s: '/foo-.png', expected: false },
        { s: '-foo.png', expected: false },
        { s: '/fo.png', expected: false },
        { s: '/b.png', expected: false },
      ])('when test string is "$s" expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo.png').test(s)

        expect(result).toEqual(expected)
      })
    })

    describe('when path is "/foo-bar"', () => {
      it.each([
        { s: '/foo-bar', expected: true },
        { s: 'foo-bar', expected: true },

        { s: '//foo-bar', expected: false },
        { s: '/foobar', expected: false },
        { s: '-foobar', expected: false },
        { s: '/fobar', expected: false },
        { s: '/bbar', expected: false },
      ])('when test string is "$s" expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo-bar').test(s)

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

    describe('when path is "/foo?/bar"', () => {
      it.each([
        { s: '/foo/bar', expected: true },
        { s: '/bar', expected: true },

        { s: '/ba', expected: false },
        { s: '/foo', expected: false },
        { s: '/f/bar', expected: false },
        { s: '/fo/bar', expected: false },
        { s: '/b', expected: false },
      ])('when test string is "$s" expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo?/bar').test(s)

        expect(result).toEqual(expected)
      })
    })

    describe('when path is "/foo+/bar"', () => {
      it.each([
        { s: '/foo/bar', expected: true },
        { s: '/foo/foo/bar', expected: true },

        { s: '/bar', expected: false },
        { s: '/ba', expected: false },
        { s: '/foo', expected: false },
        { s: '/f/bar', expected: false },
        { s: '/fo/bar', expected: false },
        { s: '/b', expected: false },
      ])('when test string is "$s" expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo+/bar').test(s)

        expect(result).toEqual(expected)
      })
    })

    describe('when path is "/foo*/bar"', () => {
      it.each([
        { s: '/bar', expected: true },
        { s: '/foo/bar', expected: true },
        { s: '/foo/foo/bar', expected: true },

        { s: '/ba', expected: false },
        { s: '/foo', expected: false },
        { s: '/f/bar', expected: false },
        { s: '/fo/bar', expected: false },
        { s: '/b', expected: false },
      ])('when test string is "$s" expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo*/bar').test(s)

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

    describe('when path is "/:foo/:bar*/baz"', () => {
      it.each([
        { s: '/hello/world/baz', expected: { foo: 'hello', bar: 'world' } },
        { s: '/hello/baz', expected: { foo: 'hello' } },
        { s: '/hello/type/script/baz', expected: { foo: 'hello', bar: 'type/script' } },

        { s: '/hello/baa', expected: undefined },
        { s: '/hello/world/abc', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/:foo/:bar*/baz').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })

    describe('when path is "/:foo/:bar+/baz"', () => {
      it.each([
        { s: '/hello/world/baz', expected: { foo: 'hello', bar: 'world' } },
        { s: '/hello/type/script/baz', expected: { foo: 'hello', bar: 'type/script' } },

        { s: '/hello/baz', expected: undefined },
        { s: '/hello/baa', expected: undefined },
        { s: '/hello/world/abc', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/:foo/:bar+/baz').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })
  })

  describe('custom match pattern', () => {
    describe('when path is "/foo/:bar(\\d+)"', () => {
      it.each([
        { s: '/foo/123', expected: { bar: '123' } },

        { s: '/foo/', expected: undefined },
        { s: '/foo/world', expected: undefined },
        { s: '/foo/123-world', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo/:bar(\\d+)').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })

    describe('when path is "/icon-:id(\\d+).png"', () => {
      it.each([
        { s: '/icon-123.png', expected: { id: '123' } },

        { s: '/icon-abc/', expected: undefined },
        { s: '/icon', expected: undefined },
        { s: '/icon-123', expected: undefined },
        { s: '/icon/123.png', expected: undefined },
        { s: '/icon-123/png', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/icon-:id(\\d+).png').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })

    describe('when path is "/foo/(bar|baz)"', () => {
      it.each([
        { s: '/foo/bar', expected: 'bar' },
        { s: '/foo/baz', expected: 'baz' },
        { s: '/foo/', expected: undefined },
        { s: '/foo/world', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo/(bar|baz)').exec(s)

        expect(result?.at(1)).toEqual(expected)
      })
    })

    describe('when path is "/foo/:name(bar|baz)"', () => {
      it.each([
        { s: '/foo/bar', expected: { name: 'bar' } },
        { s: '/foo/baz', expected: { name: 'baz' } },
        { s: '/foo/', expected: undefined },
        { s: '/foo/world', expected: undefined },
      ])('test string is $s expect $expected', ({ s, expected }) => {
        const result = new PathRegexp('/foo/:name(bar|baz)').exec(s)

        expect(result?.groups).toEqual(expected)
      })
    })
  })

  describe('toPath', () => {
    it.each([
      { s: '/:foo/:bar', params: { foo: 'a' }, expected: '/a/:bar' },
      { s: '/:foo/:bar', params: { foo: 'a', bar: undefined }, expected: '/a/:bar' },
      { s: '/:foo/:bar', params: { foo: 'a', bar: 'b' }, expected: '/a/b' },
      { s: '/:foo-:bar', params: { foo: 'a', bar: 'b' }, expected: '/a-b' },
      { s: '/:foo/:bar', params: { baz: 'a', bar: 'b' }, expected: '/:foo/b' },
      { s: '/:foo/:bar.png', params: { baz: 'a', bar: 'b' }, expected: '/:foo/b.png' },
      { s: '/a/:bar', params: { bar: 'b' }, expected: '/a/b' },
      { s: '/:foo(\\d+)/:bar', params: { foo: 123 }, expected: '/123/:bar' },
      { s: '/:foo(\\d+)/:bar', params: { foo: 'abc' }, expected: '/:foo(\\d+)/:bar' },
      { s: '/:foo(abc|def)/:bar', params: { foo: 'abc' }, expected: '/abc/:bar' },
      { s: '/:foo(abc|def)/:bar', params: { foo: 'abd' }, expected: '/:foo(abc|def)/:bar' },
    ])('test string is $s, params object is $params, expect $expected', ({ s, params, expected }) => {
      const result = new PathRegexp(s)
      expect(result?.toPath(params)).toEqual(expected)
    })

    it.each([
      { s: '/:foo/:bar', params: ['a'], expected: '/a/:bar' },
      { s: '/:foo/:bar', params: ['a', 'b'], expected: '/a/b' },
      { s: '/:foo', params: ['a', 'b'], expected: '/a' },
      { s: '/:foo-:bar', params: ['a', 'b'], expected: '/a-b' },
      { s: '/:foo/:bar.png', params: ['a', 'b'], expected: '/a/b.png' },
      { s: '/a/:bar', params: ['b'], expected: '/a/b' },
      { s: '/:foo(\\d+)/:bar', params: [123], expected: '/123/:bar' },
      { s: '/:foo(\\d+)/:bar', params: [], expected: '/:foo(\\d+)/:bar' },
      { s: '/:foo(abc|def)/:bar', params: ['abc'], expected: '/abc/:bar' },
    ])('test string is $s, params list is $params, expect $expected', ({ s, params, expected }) => {
      const result = new PathRegexp(s)
      expect(result?.toPath(params)).toEqual(expected)
    })
  })
})
