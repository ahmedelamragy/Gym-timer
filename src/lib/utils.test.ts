import { describe, expect, it } from 'vitest'
import { clamp, safeNext } from './utils'

describe('safeNext', () => {
  it('keeps same-site paths, including query strings', () => {
    expect(safeNext('/workouts/new')).toBe('/workouts/new')
    expect(safeNext('/run?id=abc')).toBe('/run?id=abc')
  })

  it.each([
    ['absolute URL', 'https://evil.example'],
    ['protocol-relative', '//evil.example'],
    ['backslash', '/\\evil.example'],
    ['backslash later in path', '/a\\..\\\\evil.example'],
    ['tab trick', '/\t/evil.example'],
    ['newline trick', '/\n/evil.example'],
    ['carriage return', '/\r/evil.example'],
    ['decoded %09', decodeURIComponent('/%09/evil.example')],
    ['javascript scheme', 'javascript:alert(1)'],
    ['relative path', 'workouts'],
    ['empty', ''],
    ['missing', null],
  ])('rejects %s', (_label, value) => {
    expect(safeNext(value)).toBe('/workouts')
  })

  it('every accepted value resolves to our own host', () => {
    for (const v of ['/x', '/run?id=1', '/%2F%2Fevil.example', '/.%2e/evil.example']) {
      const out = safeNext(v)
      expect(new URL(out, 'https://gym-timer.example').host).toBe('gym-timer.example')
    }
  })
})

describe('clamp', () => {
  it('limits to the range', () => {
    expect(clamp(0, 1, 99)).toBe(1)
    expect(clamp(120, 1, 99)).toBe(99)
    expect(clamp(8, 1, 99)).toBe(8)
  })
})
