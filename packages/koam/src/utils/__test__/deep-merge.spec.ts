import { describe, expect, it } from 'vitest'
import { deepMerge } from '../deep-merge'

describe('# deepMerge', () => {
  it('should not modify source object and target object', () => {
    const source = { a: 'a' }
    const target = { b: 'b' }
    const result = deepMerge(source, target)

    expect(source).toEqual({ a: 'a' })
    expect(target).toEqual({ b: 'b' })
    expect(result).toEqual({ a: 'a', b: 'b' })
  })

  it('should always target when source or target is not an object', () => {
    expect(deepMerge(1, {})).toEqual({})
    expect(deepMerge({}, 1)).toEqual({})
    expect(deepMerge(null, {})).toEqual({})
    expect(deepMerge({}, null)).toEqual({})
  })

  it('should can handle nested object', () => {
    const source = {
      a: 'a',
      b: {
        c: 'c',
        d: {
          e: 'e',
        },
      },
      f: {},
    }
    const target = {
      b: {
        d: {
          e: 'e1',
          i: null,
        },
        g: 'g',
      },
      f: null,
    }
    const result = deepMerge(source, target)

    expect(result).toEqual({
      a: 'a',
      b: {
        c: 'c',
        d: {
          e: 'e1',
          i: null,
        },
        g: 'g',
      },
      f: {},
    })
  })
})
