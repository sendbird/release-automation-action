import {describe, expect, it} from '@jest/globals'
import {getCommandParams} from '../../src/command'
import {COMMAND_DEFAULT_PARAMS} from '../../src/constants'

describe('getCommandParams', () => {
  it('should return default parameters when no candidates are provided', () => {
    const params = getCommandParams([])
    expect(params).toEqual(COMMAND_DEFAULT_PARAMS)
  })

  it('should parse parameters correctly', () => {
    const params = getCommandParams(['--test=true', '--ci=github'])
    expect(params).toEqual({test: true, ci: 'github'})

    const params2 = getCommandParams(['--test', '--ci=circleci'])
    expect(params2).toEqual({test: true, ci: 'circleci'})
  })

  it('should ignore parameters without the correct prefix', () => {
    const params = getCommandParams(['test=true', `ci=github`])
    expect(params).toEqual(COMMAND_DEFAULT_PARAMS)
  })
})
