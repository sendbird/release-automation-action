import * as core from '@actions/core'
import * as github from '@actions/github'
import {BRANCH_HOTFIX_PREFIX, BRANCH_RELEASE_PREFIX} from './constants'
import type {
  IssueCommentCreatedEvent,
  WebhookEventName
} from '@octokit/webhooks-definitions/schema'
import {buildCommand} from './command'

// https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
async function run(): Promise<void> {
  try {
    if ((github.context.eventName as WebhookEventName) === 'issue_comment') {
      const pushPayload = github.context.payload as IssueCommentCreatedEvent

      // CIRCLECI_TOKEN: 1Password > sha.sdk_deployment > Circle API Token
      const circleci_token = core.getInput('circleci_token')
      const gh_token = core.getInput('gh_token')
      const octokit = github.getOctokit(gh_token)

      const {data: pull} = await octokit.rest.pulls.get({
        ...github.context.repo,
        pull_number: github.context.issue.number
      })
      core.info(`pull head ref: ${pull.head.ref}`)
      const isPRComment = pushPayload.comment.html_url.includes('pull')
      const isReleaseBranch = Boolean(
        pull.head.ref.startsWith(BRANCH_RELEASE_PREFIX) ||
          pull.head.ref.startsWith(BRANCH_HOTFIX_PREFIX)
      )

      const command = buildCommand(pushPayload.comment.body, {
        gh_token,
        circleci_token,
        octokit,
        isPRComment,
        isReleaseBranch
      })

      await command?.run()
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
