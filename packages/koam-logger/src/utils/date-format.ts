/* eslint-disable unicorn/switch-case-braces */

/**
 * Format date to string
 *
 * @param date
 * @param pattern - The pattern to format date
 *
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
export function dateFormat(date: Date | string, pattern: string): string {
  if (typeof date === 'string')
    date = new Date(date)

  let placeholderCount = 0
  const placeholders: string[] = []

  // Extract raw string (quoted strings) and replace them with placeholders.
  pattern = pattern.replaceAll(/(['"])([^\1]*)\1/g, (_, __, match) => {
    const placeholder = `%p${placeholderCount++}%`
    placeholders.push(match)
    return placeholder
  })

  pattern = pattern.replaceAll(/([YMDdWwHhmsSAaXxZ])\1*/g, match => {
    assert(date instanceof Date)
    switch (match) {
      case 'YYYY': return date.getFullYear().toString()
      case 'M': return (date.getMonth() + 1).toString()
      case 'MM': return (date.getMonth() + 1).toString().padStart(2, '0')
      case 'D': return date.getDate().toString()
      case 'DD': return date.getDate().toString().padStart(2, '0')
      case 'DDD': return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000).toString()
      case 'DDDD': return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 86400000).toString().padStart(3, '0')
      case 'd': return date.getDay().toString()
      case 'ddd': return ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][date.getDay()]
      case 'dddd': return ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][date.getDay()]
      case 'w': return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 604800000).toString()
      case 'ww': return Math.floor((date.getTime() - new Date(date.getFullYear(), 0, 0).getTime()) / 604800000).toString().padStart(2, '0')
      case 'H': return date.getHours().toString()
      case 'HH': return date.getHours().toString().padStart(2, '0')
      case 'h': return (date.getHours() % 12).toString()
      case 'hh': return (date.getHours() % 12).toString().padStart(2, '0')
      case 'm': return date.getMinutes().toString()
      case 'mm': return date.getMinutes().toString().padStart(2, '0')
      case 's': return date.getSeconds().toString()
      case 'ss': return date.getSeconds().toString().padStart(2, '0')
      case 'SSS': return date.getMilliseconds().toString().padStart(3, '0')
      case 'A': return date.getHours() < 12 ? 'AM' : 'PM'
      case 'a': return date.getHours() < 12 ? 'am' : 'pm'
      case 'Z': {
        const offset = date.getTimezoneOffset()
        const sign = offset >= 0 ? '-' : '+'
        const hours = Math.abs(Math.trunc(offset / 60)).toString().padStart(2, '0')
        const minutes = Math.abs(offset % 60).toString().padStart(2, '0')
        return `${sign}${hours}${minutes}`
      }
      case 'ZZ': {
        const offset = date.getTimezoneOffset()
        const sign = offset >= 0 ? '-' : '+'
        const hours = Math.abs(Math.trunc(offset / 60)).toString().padStart(2, '0')
        const minutes = Math.abs(offset % 60).toString().padStart(2, '0')
        return `${sign}${hours}:${minutes}`
      }
      case 'X': return Math.floor(date.getTime() / 1000).toString()
      case 'x': return date.getTime().toString()
      default: return match
    }
  })

  pattern = pattern.replaceAll(/%p(\d+)%/g, (_, i) => placeholders[Number(i)])

  return pattern
}
