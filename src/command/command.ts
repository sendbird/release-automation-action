import * as github from '@actions/github'
import * as core from '@actions/core'

export interface Command {
  run(): Promise<void>
}

export type CommandArguments = {
  gh_token: string
  circleci_token: string
  octokit: ReturnType<typeof github.getOctokit>
  branch: string
  isPRComment: boolean
  [key: string]: unknown
}

export type CommandParameters = {
  test: boolean
  [key: string]: unknown
}

export abstract class CommandAbstract implements Command {
  constructor(
    protected readonly target: string,
    protected readonly args: CommandArguments,
    protected readonly params: CommandParameters
  ) {
    this.log(`target: ${target}`)
  }

  protected log(message: string): void {
    core.info(`${this.constructor.name}: ${message}`)
  }

  abstract run(): Promise<void>
}
