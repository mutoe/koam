import { intersection } from 'src/utils/intersection'

describe('intersection', () => {
  it('both arrays are empty', () => {
    expect(intersection([], [])).toEqual([])
  })

  it('one array is empty', () => {
    expect(intersection([1, 2], [])).toEqual([])
    expect(intersection([], [1, 2])).toEqual([])
  })

  it('intersecting arrays', () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
  })

  it('no intersection', () => {
    expect(intersection([1, 2, 3], [4, 5, 6])).toEqual([])
  })

  it('duplicate elements', () => {
    expect(intersection([1, 2, 2, 3], [2, 2, 4])).toEqual([2])
  })
})
