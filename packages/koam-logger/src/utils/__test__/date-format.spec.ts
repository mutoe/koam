import { dateFormat } from '../date-format'

/**
 * Format date to string
 *  Refer https://momentjs.com/docs/#/displaying/format/
 *
 *  - `YYYY` - Year. e.g. 2023
 *  - `M` - Month. e.g. 1 2 ... 11 12
 *  - `MM` - Month (leading zero). e.g. 01 02 ... 11 12
 *  - `D` - Day. e.g. 1 2 ... 30 31
 *  - `DD` - Day (leading zero). e.g. 01 02 ... 30 31
 *  - `DDD` - Day of year. e.g. 1 2 ... 364 365
 *  - `DDDD` - Day of year (leading zero). e.g. 001 002 ... 364 365
 *  - `d` - Day of week. e.g. 0 1 ... 5 6
 *  - `ddd` - Day of week (short). e.g. Sun Mon ... Fri Sat
 *  - `dddd` - Day of week (long). e.g. Sunday Monday ... Friday Saturday
 *  - `w` - Week of year. e.g. 1 2 ... 52 53
 *  - `ww` - Week of year (leading zero). e.g. 01 02 ... 52 53
 *  - `H` - Hour (24-hour clock). e.g. 0 1 ... 22 23
 *  - `HH` - Hour (24-hour clock, leading zero). e.g. 00 01 ... 22 23
 *  - `h` - Hour (12-hour clock). e.g. 1 2 ... 11 12
 *  - `hh` - Hour (12-hour clock, leading zero). e.g. 01 02 ... 11 12
 *  - `mm` - Minute (leading zero). e.g. 01 02 ... 58 59
 *  - `m` - Minute. e.g. 1 2 ... 58 59
 *  - `ss` - Second (leading zero). e.g. 01 02 ... 58 59
 *  - `s` - Second. e.g. 1 2 ... 58 59
 *  - `SSS` - Millisecond (leading zero). e.g. 001 002 ... 998 999
 *  - `ZZ` - Timezone. e.g. -07:00 -06:00 ... +06:00 +07:00
 *  - `Z` - Timezone. e.g. -0700 -0600 ... +0600 +0700
 *  - `A` - AM/PM. e.g. AM PM
 *  - `a` - am/pm. e.g. am pm
 *  - `X` - Unix timestamp. e.g. 1410715640
 *  - `x` - Unix timestamp in milliseconds. e.g. 1410715640000
 *  - `'any string'` - Raw string
 */

describe('# Date format', () => {
  it.each([
    ['YYYY-MM-DDTHH:mm:ss.SSSZ', '2023-06-07T12:01:06.789+0800'],
    ['YYYY/M/D H:m:sA ZZ', '2023/6/7 12:1:6PM +08:00'],
    ['"day of year: "DDD DDDD', 'day of year: 158 158'],
    ['"day of week: "d ddd dddd', 'day of week: 3 Wed Wednesday'],
    ['"week of year: "w ww', 'week of year: 22 22'],
    ['\'unix timestamp: \'X', 'unix timestamp: 1686110466'],
    ['\'unix timestamp in milliseconds: \'x', 'unix timestamp in milliseconds: 1686110466789'],
  ])('%s', (pattern, expected) => {
    const date = new Date('2023-06-07T12:01:06.789+08:00')
    expect(dateFormat(date, pattern)).toBe(expected)
  })
})
