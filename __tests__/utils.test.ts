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

    expect(extractVersion('release/test/1.2.3')).toBe('1.2.3')
    expect(extractVersion('release/test/v1.2.3')).toBe('1.2.3')
    expect(extractVersion('release/ktx/test/v1.2.3')).toBe('1.2.3')
  })

  test('should return an empty string if the branch convention is invalid', () => {
    expect(extractVersion('v1.2.3')).toBe('')
    expect(extractVersion('1.2.3')).toBe('')
    expect(extractVersion('unknown/1.2.3')).toBe('')
    expect(extractVersion('hotfixx/1.2.3')).toBe('')
    expect(extractVersion('hotfixx/v1.2.3')).toBe('')
    expect(extractVersion('releases/1.2.3')).toBe('')
    expect(extractVersion('releases/v1.2.3')).toBe('')
  })

  test('should return the version with the tag', () => {
    expect(extractVersion('hotfix/swift/v1.2.3-beta')).toBe('1.2.3-beta')

    expect(extractVersion('release/ktx/1.2.3-beta.0')).toBe('1.2.3-beta.0')
    expect(extractVersion('hotfix/ktx/1.2.3-beta.0')).toBe('1.2.3-beta.0')

    expect(extractVersion('release/compose/1.2.3-beta.0')).toBe('1.2.3-beta.0')
    expect(extractVersion('hotfix/compose/1.2.3-beta.0')).toBe('1.2.3-beta.0')

    expect(extractVersion('release/swift/v1.2.3-rc.0')).toBe('1.2.3-rc.0')
    expect(extractVersion('hotfix/swift/v1.2.3-rc.0')).toBe('1.2.3-rc.0')
  })
})
