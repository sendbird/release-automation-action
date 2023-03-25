import * as core from '@actions/core'
import * as github from '@actions/github'
import type {
  IssueCommentCreatedEvent,
  WebhookEventName
} from '@octokit/webhooks-definitions/schema'
import {buildCommand} from './command'

// https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
// CIRCLECI_TOKEN: 1Password > sha.sdk_deployment > Circle API Token
const circleci_token = core.getInput('circleci_token')
const gh_token = core.getInput('gh_token')

async function run(): Promise<void> {
  try {
    if ((github.context.eventName as WebhookEventName) === 'issue_comment') {
      const payload = github.context.payload as IssueCommentCreatedEvent
      const octokit = github.getOctokit(gh_token)

      const {data: pull} = await octokit.rest.pulls.get({
        ...github.context.repo,
        pull_number: github.context.issue.number
      })

      const command = buildCommand(payload.comment.body, {
        gh_token,
        circleci_token,
        octokit,
        branch: pull.head.ref,
        isPRComment: payload.comment.html_url.includes('pull')
      })

      await command?.run()
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

run()
