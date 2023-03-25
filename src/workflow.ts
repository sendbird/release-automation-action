import * as core from '@actions/core'
import * as github from '@actions/github'
import fetch from 'node-fetch'

import type {CommandArguments} from './command/command'
import {WORKFLOW_REPO, WORKFLOW_SCRIPT_VERSION} from './constants'
import {
  buildReleaseJiraTicket,
  buildReleaseJiraVersion,
  extractVersion
} from './utils'

type WorkflowResponse = {
  [key: string]: unknown
}

type BasicRequestParams = {
  script_version: string
  platform: string
  product: string
  repo_name: string
}

const workflowRequest = async (
  args: CommandArguments,
  parameters: object
): Promise<WorkflowResponse> => {
  const response = await fetch(
    `https://circleci.com/api/v2/project/gh/${WORKFLOW_REPO}/pipeline`,
    {
      method: 'POST',
      headers: {
        'Circle-Token': args.circleci_token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({parameters})
    }
  )

  return response.json()
}

export const workflow = {
  log(message: string) {
    core.info(`Workflow: ${message}`)
  },
  async createTicket(args: CommandArguments): Promise<{workflowUrl: string}> {
    const parameters = buildCreateTicketParams(args)
    const response = await workflowRequest(args, parameters)
    this.log(`response: ${JSON.stringify(response, null, 2)}`)
    return {
      workflowUrl: `https://app.circleci.com/pipelines/github/${WORKFLOW_REPO}/${response.number}`
    }
  }
}
function buildCreateTicketParams(args: CommandArguments): object {
  const basicParams = buildBasicRequestParams()
  return {
    ...basicParams,
    run_workflow_create_ticket: true,
    product_jira_project_key: core.getInput('product_jira_project_key'),
    product_jira_version_prefix: core.getInput('product_jira_version_prefix'),
    release_branch: args.branch,
    release_version: extractVersion(args.branch),
    release_pr_number: github.context.issue.number,
    release_jira_version: buildReleaseJiraVersion(
      basicParams.platform,
      basicParams.product,
      basicParams.platform,
      core.getInput('framework')
    ),
    release_jira_ticket: buildReleaseJiraTicket(
      basicParams.platform,
      basicParams.product,
      basicParams.platform,
      core.getInput('framework')
    )
  }
}

function buildBasicRequestParams(): BasicRequestParams {
  return {
    script_version: WORKFLOW_SCRIPT_VERSION,
    platform: core.getInput('platform'),
    product: core.getInput('product'),
    repo_name: github.context.repo.repo
  }
}
