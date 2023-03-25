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

    this.log('Add a comment about preparing ticket creation')
    await this.args.octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: github.context.issue.number,
      body: `[Creating Ticket] Preparing ${github.context.serverUrl}/${owner_repo}/actions/runs/${github.context.runId}`
    })

    // Get pr head branch
    if (!isReleaseBranch(this.args.branch)) {
      return this.log("it's not releasable 🙅")
    } else {
      this.log("it's releasable 🚀")
    }

    this.log('Workflow request to create a ticket')
    const {workflowUrl} = await workflow.createTicket(this.args)

    this.log('Add a comment about processing ticket creation')
    await this.args.octokit.rest.issues.createComment({
      ...github.context.repo,
      issue_number: github.context.issue.number,
      body: `[Creating Ticket] In progress ${workflowUrl}`
    })
  }
}
