/* eslint-disable test/consistent-test-it */
import { bench, describe } from 'vitest'

describe('match', () => {
  const contentType = 'text/plain;charset=UTF-8'
  const matchers = ['text/plain', 'application/json']

  bench('includes', () => {
    for (const matcher of matchers)
      contentType.includes(matcher)
  })

  bench('regexp + for', () => {
    for (const matcher of matchers)
      contentType.match(new RegExp(matcher))
  })

  bench('regexp + or', () => {
    contentType.match(/(text\/plain|application\/json)/)
  })

  bench('indexOf', () => {
    for (const matcher of matchers)
      contentType.indexOf(matcher)
  })
})
