import type Response from '../response'

/*!
 * vary (koam compatible)
 * Based on https://github.com/jshttp/vary/blob/master/index.js
 *
 * Copyright(c) 2014-2017 Douglas Christopher Wilson
 * MIT Licensed
 */

/**
 * RegExp to match field-name in RFC 7230 sec 3.2
 *
 * field-name    = token
 * token         = 1*tchar
 * tchar         = "!" / "#" / "$" / "%" / "&" / "'" / "*"
 *               / "+" / "-" / "." / "^" / "_" / "`" / "|" / "~"
 *               / DIGIT / ALPHA
 *               ; any VCHAR, except delimiters
 */
const FIELD_NAME_REGEXP = /^[!#$%&'*+\-.^_`|~0-9A-Za-z]+$/

/**
 * Append a field to a vary header.
 */
function append(header: string, field: string | string[]): string {
  // get fields array
  const fields = Array.isArray(field) ? field : parse(field)

  // assert on invalid field names
  for (const field_ of fields) {
    if (!FIELD_NAME_REGEXP.test(field_))
      throw new TypeError('field argument contains an invalid header name')
  }

  // existing, unspecified vary
  if (header === '*')
    return header

  // enumerate current values
  let val = header
  const vals = parse(header.toLowerCase())

  // unspecified vary
  if (fields.includes('*') || vals.includes('*'))
    return '*'

  for (const field_ of fields) {
    const fld = field_.toLowerCase()

    // append value (case-preserving)
    if (!vals.includes(fld)) {
      vals.push(fld)
      val = val ? `${val}, ${field_}` : field_
    }
  }

  return val
}

function parse(header: string): string[] {
  let end = 0
  let start = 0
  const list = []

  // gather tokens
  for (let i = 0, len = header.length; i < len; i++) {
    switch (header.codePointAt(i)) {
      case 0x20: { /*   */
        if (start === end)
          start = end = i + 1
        break
      }
      case 0x2C: { /* , */
        list.push(header.slice(start, end))
        start = end = i + 1
        break
      }
      default: {
        end = i + 1
        break
      }
    }
  }

  // final token
  list.push(header.slice(start, end))

  return list
}

/**
 * Mark that a request is varied on a header field.
 */
export function vary(response: Response, field: string | string[]) {
  // get existing header
  let val = response.get('Vary') || ''
  const header = Array.isArray(val) ? val.join(', ') : val

  const formattedFields = [field]
    .flat()
    .join(',')
    .split(',')
    .map(field => field.trim())
    .filter(Boolean)

  val = append(header, formattedFields)
  if (val)
    response.set('Vary', val)
}
