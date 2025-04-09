import * as github from '@actions/github';
import * as core from '@actions/core';

export interface Command {
  run(): Promise<void>;
}

export type CommandArguments = {
  gh_token: string;
  circleci_token: string;
  octokit: ReturnType<typeof github.getOctokit>;
  branch: string;
  isPRComment: boolean;
  [key: string]: unknown;
};

export type CommandParameters = {
  test: boolean;
  ci: 'github' | 'circleci';
  [key: string]: unknown;
};

type UpsertCommentParams = {
  search: string;
  body: string;
  issueNumber: number;
};

export abstract class CommandAbstract implements Command {
  constructor(
    protected readonly target: string,
    protected readonly args: CommandArguments,
    protected readonly params: CommandParameters,
  ) {
    this.log(`target: ${target}`);
  }

  protected log(message: string): void {
    core.info(`${this.constructor.name}: ${message}`);
  }

  protected async upsertComment({ body, search, issueNumber }: UpsertCommentParams): Promise<void> {
    const { data: comments } = await this.args.octokit.rest.issues.listComments({
      ...github.context.repo,
      issue_number: issueNumber,
    });

    const existingComment = comments.find((comment) => comment.body?.includes(search));

    if (existingComment) {
      await this.args.octokit.rest.issues.updateComment({
        ...github.context.repo,
        comment_id: existingComment.id,
        body,
      });
    } else {
      await this.args.octokit.rest.issues.createComment({
        ...github.context.repo,
        issue_number: issueNumber,
        body,
      });
    }
  }

  abstract run(): Promise<void>;
}
