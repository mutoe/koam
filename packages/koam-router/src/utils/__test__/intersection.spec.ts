import { intersection } from 'src/utils/intersection'

describe('intersection', () => {
  test('both arrays are empty', () => {
    expect(intersection([], [])).toEqual([])
  })

  test('one array is empty', () => {
    expect(intersection([1, 2], [])).toEqual([])
    expect(intersection([], [1, 2])).toEqual([])
  })

  test('intersecting arrays', () => {
    expect(intersection([1, 2, 3], [2, 3, 4])).toEqual([2, 3])
  })

  test('no intersection', () => {
    expect(intersection([1, 2, 3], [4, 5, 6])).toEqual([])
  })

  test('duplicate elements', () => {
    expect(intersection([1, 2, 2, 3], [2, 2, 4])).toEqual([2])
  })
})
