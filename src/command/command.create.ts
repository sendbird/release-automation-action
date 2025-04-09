import * as github from '@actions/github';
import { CommandAbstract } from './command';
import { isReleaseBranch } from '../utils';
import { workflow } from './workflow';
import { COMMAND_TARGETS } from '../constants';

export default class CreateCommand extends CommandAbstract {
  async run(): Promise<void> {
    switch (this.target) {
      case COMMAND_TARGETS.TICKET:
        return this.createTicket();
      default:
        return;
    }
  }

  async createTicket(): Promise<void> {
    const owner_repo = `${github.context.repo.owner}/${github.context.repo.repo}`;

    this.log('Add a comment about preparing ticket creation');
    await this.upsertComment({
      search: '[Creating Ticket] Preparing',
      body: `[Creating Ticket] Preparing ${github.context.serverUrl}/${owner_repo}/actions/runs/${github.context.runId}`,
      issueNumber: github.context.issue.number,
    });

    if (!isReleaseBranch(this.args.branch)) {
      return this.log("it's not releasable 🙅");
    } else {
      this.log("it's releasable 🚀");
    }

    this.log('Workflow request to create a ticket');
    const { workflowUrl } = await workflow.createTicket(this.args, this.params);

    this.log('Add a comment about processing ticket creation');
    await this.upsertComment({
      search: '[Creating Ticket] In progress',
      body: `[Creating Ticket] In progress ${workflowUrl}`,
      issueNumber: github.context.issue.number,
    });
  }
}
