import * as core from '@actions/core'
import * as github from '@actions/github'
import fetch from 'node-fetch'

import type {CommandArguments, CommandParameters} from './command/command'
import {WORKFLOW_REPO, WORKFLOW_SCRIPT_VERSION, WORKFLOWS} from './constants'
import {
  buildJiraVersionPrefix,
  buildReleaseJiraTicket,
  buildReleaseJiraVersion,
  extractVersion,
  replaceVersion
} from './utils'

type WorkflowResponse = {
  response: {
    [key: string]: unknown
  }
  repository: string
}

type BasicRequestParams = {
  script_version: string
  platform: string
  product: string
  repo_name: string
}

const workflowRequest = async (
  args: CommandArguments,
  parameters: object,
  repository = WORKFLOW_REPO
): Promise<WorkflowResponse> => {
  const response = await fetch(
    `https://circleci.com/api/v2/project/gh/${repository}/pipeline`,
    {
      method: 'POST',
      headers: {
        'Circle-Token': args.circleci_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({parameters})
    }
  )

  return {
    response: await response.json(),
    repository
  }
}

export const workflow = {
  log(message: string) {
    core.info(`Workflow: ${message}`)
  },
  async createTicket(
    commandArgs: CommandArguments,
    commandParams: CommandParameters
  ): Promise<{workflowUrl: string}> {
    const ticketParams = await buildCreateTicketParams(
      commandArgs,
      commandParams
    )

    if ('test' in ticketParams && ticketParams.test) {
      this.log('Run on test environment')
    }

    const {repository, response} = await workflowRequest(
      commandArgs,
      ticketParams
    )
    this.log(`response: ${JSON.stringify(response, null, 2)}`)

    if (response.message === 'Project not found') {
      this.log(
        'Please check first, valid token has been provided to CI' +
          "\nIf not, it looks like sendbird org authorize on the bot's GitHub account has been broken." +
          "\n1. Please SSO log in and re-authenticate using bot's GitHub account" +
          '\n2. https://app.circleci.com/settings/user > Refresh permissions'
      )
      throw new Error(
        "Bot's GitHub account seems not authorized to organization"
      )
    }

    if (response.message === 'Permission denied') {
      this.log(
        "It looks like bot can't access to project" +
          '\n1. Please add bot as a admin to the GitHub project and add User Key in CircleCI Settings > SSH Keys' +
          '\n2. https://github.com/settings/keys > Configure SSO > Authorize'
      )
      throw new Error('Bot cannot access to project')
    }

    return {
      workflowUrl: `https://app.circleci.com/pipelines/github/${repository}/${response.number}`
    }
  }
}
async function buildCreateTicketParams(
  args: CommandArguments,
  params: CommandParameters
): Promise<object> {
  const basicParams = buildBasicRequestParams(WORKFLOWS.CREATE_TICKET)
  const release_version = extractVersion(args.branch)

  let latestReleaseLink = ''
  try {
    const latestRelease = await args.octokit.rest.repos.getLatestRelease(
      github.context.repo
    )
    latestReleaseLink = latestRelease.data.html_url
  } catch (e) {
    latestReleaseLink = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/releases/tag/0.0.0`
  }

  return {
    ...basicParams,
    test: core.getBooleanInput('test') || params.test,
    product_jira_project_key: core.getInput('product_jira_project_key'),
    product_jira_version_prefix:
      core.getInput('product_jira_version_prefix') ||
      buildJiraVersionPrefix(
        basicParams.platform,
        basicParams.product,
        core.getInput('framework').toLowerCase()
      ),
    release_branch: args.branch,
    release_version,
    release_gh_link: replaceVersion(latestReleaseLink, release_version),
    release_pr_number: github.context.issue.number,
    release_jira_version: buildReleaseJiraVersion(
      basicParams.platform,
      basicParams.product,
      release_version,
      core.getInput('framework').toLowerCase()
    ),
    release_jira_ticket: buildReleaseJiraTicket(
      basicParams.platform,
      basicParams.product,
      release_version,
      core.getInput('framework').toLowerCase()
    ),
    changelog_file: core.getInput('changelog_file') || 'CHANGELOG_DRAFT.md'
  }
}

function buildBasicRequestParams(workflowName: string): BasicRequestParams {
  return {
    [workflowName]: true,
    script_version: WORKFLOW_SCRIPT_VERSION,
    platform: core.getInput('platform').toLowerCase(),
    product: core.getInput('product').toLowerCase(),
    repo_name: github.context.repo.repo
  }
}
