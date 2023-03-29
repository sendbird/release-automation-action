import * as core from '@actions/core'
import * as github from '@actions/github'
import * as exec from '@actions/exec'
import type {
  IssueCommentCreatedEvent,
  WebhookEventName
} from '@octokit/webhooks-definitions/schema'
import {buildCommand} from './command'
import {SENDBIRD_BOT_USERNAME} from './constants'

// https://docs.github.com/en/actions/learn-github-actions/variables#default-environment-variables
// CIRCLECI_TOKEN: 1Password > Circle API Token
const circleci_token = core.getInput('circleci_token')
const gh_token = core.getInput('gh_token')

async function run(): Promise<void> {
  try {
    if ((github.context.eventName as WebhookEventName) === 'issue_comment') {
      const payload = github.context.payload as IssueCommentCreatedEvent
      const octokit = github.getOctokit(gh_token)

      const pull = await octokit.rest.pulls.get({
        ...github.context.repo,
        pull_number: github.context.issue.number
      })

      const comment = payload.comment.body.toLowerCase()
      const command = buildCommand(comment, {
        gh_token,
        circleci_token,
        octokit,
        branch: pull.data.head.ref,
        isPRComment: payload.comment.html_url.includes('pull')
      })

      if (command) {
        const hasPermission = await checkPermission(
          payload.comment.user.login,
          octokit
        )

        if (hasPermission) await command.run()
        else core.info('No permission to run command')
      }
    }
  } catch (error) {
    if (error instanceof Error) core.setFailed(error.message)
  }
}

async function checkPermission(
  username: string,
  octokit: ReturnType<typeof github.getOctokit>
): Promise<boolean> {
  if (
    username === github.context.repo.owner ||
    username === SENDBIRD_BOT_USERNAME
  ) {
    return true
  }

  try {
    const {data} = await octokit.rest.repos.getCollaboratorPermissionLevel({
      ...github.context.repo,
      username
    })
    return ['admin', 'write'].some(it => data.permission === it)
  } catch (e) {
    return false
  }
}

async function execInputCommands(name: string): Promise<void> {
  const tasks = core
    .getInput(name)
    .split('\n')
    .map(command => () => exec.exec(command))

  await tasks.reduce(async (promise, task) => {
    await promise
    return task()
  }, Promise.resolve(0))
}

run()
