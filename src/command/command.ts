import * as github from '@actions/github'

export interface Command {
  run(): Promise<void>
}

export type CommandArguments = {
  gh_token: string
  circleci_token: string
  octokit: ReturnType<typeof github.getOctokit>
  isPRComment: boolean
  isReleaseBranch: boolean
  [key: string]: unknown
}

export abstract class CommandAbstract implements Command {
  constructor(
    protected readonly target: string,
    protected readonly args: CommandArguments
  ) {}

  abstract run(): Promise<void>
}
