import * as core from '@actions/core'
import * as github from '@actions/github'
import {CommandAbstract} from './command'
import {isReleaseBranch} from '../utils'
import {workflow} from '../workflow'

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
    const owner_repo = `${github.context.repo.owner}/${github.context.repo.repo}`

    // Add a comment about preparing ticket creation
    await this.args.octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: github.context.issue.number,
      body: `[Creating Ticket] Preparing ${github.context.serverUrl}/${owner_repo}/actions/runs/${github.context.runId}`
    })

    // Get pr head branch
    if (!isReleaseBranch(this.args.branch)) {
      return core.info("it's not releasable 🙅")
    } else {
      core.info("it's releasable 🚀")
    }

    // Trigger ticket creation
    const {workflowUrl} = await workflow.createTicket(this.args)

    // Add a comment about processing ticket creation
    await this.args.octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: github.context.issue.number,
      body: `[Creating Ticket] In progress ${workflowUrl}`
    })
  }
}
