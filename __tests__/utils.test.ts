import {describe, test, expect} from '@jest/globals'
import {extractVersion} from '../src/utils'

describe('extractVersion', () => {
  test('should return the version if the branch convention is valid', () => {
    expect(extractVersion('hotfix/1.2.3')).toBe('1.2.3')
    expect(extractVersion('hotfix/v1.2.3')).toBe('1.2.3')
    expect(extractVersion('hotfix/ktx/v1.2.3')).toBe('1.2.3')

    expect(extractVersion('release/1.2.3')).toBe('1.2.3')
    expect(extractVersion('release/v1.2.3')).toBe('1.2.3')
    expect(extractVersion('release/ktx/v1.2.3')).toBe('1.2.3')
  })

  test('Should return an empty string if the branch convention is invalid', () => {
    expect(extractVersion('v1.2.3')).toBe('')
    expect(extractVersion('1.2.3')).toBe('')
    expect(extractVersion('unknown/1.2.3')).toBe('')
    expect(extractVersion('hotfixx/1.2.3')).toBe('')
    expect(extractVersion('hotfixx/v1.2.3')).toBe('')
    expect(extractVersion('releases/1.2.3')).toBe('')
    expect(extractVersion('releases/v1.2.3')).toBe('')
  })
})
