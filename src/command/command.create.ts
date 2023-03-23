import * as core from '@actions/core'
import * as github from '@actions/github'
import {CommandAbstract} from './command'
import fetch from 'node-fetch'

export default class CreateCommand extends CommandAbstract {
  async run(): Promise<void> {
    switch (this.target) {
      case 'ticket':
        return this.createTicket()
      default:
        return
    }
  }

  async createTicket(): Promise<void> {
    const repo = `${github.context.repo.owner}/${github.context.repo.repo}`
    // Add a comment about preparing ticket creation
    await this.args.octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: github.context.issue.number,
      body: `[Creating Ticket] Preparing ${github.context.serverUrl}/${repo}/actions/runs/${github.context.runId}`
    })

    // Get pr head branch
    if (!this.args.isReleaseBranch) {
      return core.info("it's not releasable 🙅")
    } else {
      core.info("it's releasable 🚀")
    }

    // Trigger ticket creation
    // NOTE: It would be better to implement pipeline to sendbird/sdk-deployment directly
    const response = await fetch(
      `https://circleci.com/api/v2/project/gh/${repo}/pipeline`,
      {
        method: 'POST',
        headers: {
          'Circle-Token': this.args.circleci_token,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          branch: github.context.ref,
          parameters: {
            run_workflow_create_ticket: true,
            release_pr_number: github.context.issue.number
          }
        })
      }
    )
    const result = (await response.json()) as {[key: string]: unknown}
    core.info(`api result: ${JSON.stringify(response, null, 2)}`)

    // Add a comment about processing ticket creation
    await this.args.octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: github.context.issue.number,
      body: `[Creating Ticket] In progress https://app.circleci.com/pipelines/github/${repo}/${result.number}`
    })
  }
}
