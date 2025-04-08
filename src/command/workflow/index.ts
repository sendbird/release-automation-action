import * as core from '@actions/core';
import * as github from '@actions/github';

import type { CommandArguments, CommandParameters } from '../command';
import { WORKFLOW_SCRIPT_VERSION, WORKFLOWS } from '../../constants';
import {
  buildJiraVersionPrefix,
  buildReleaseJiraTicket,
  buildReleaseJiraVersion,
  extractVersion,
  replaceVersion,
} from '../../utils';
import { triggerCreateTicketWorkflow } from './triggerCreateTicketWorkflow';

type BasicRequestParams = {
  script_version: string;
  platform: string;
  product: string;
  repo_name: string;
};

export const workflow = {
  async createTicket(
    commandArgs: CommandArguments,
    commandParams: CommandParameters,
  ): Promise<{ workflowUrl: string }> {
    const ticketParams = await buildCreateTicketParams(commandArgs, commandParams);

    if ('test' in ticketParams && ticketParams.test) {
      core.info('Workflow: Run on test environment');
    }

    const { workflowUrl } = await triggerCreateTicketWorkflow({
      args: commandArgs,
      parameters: ticketParams,
      ci: commandParams.ci,
    });

    return {
      workflowUrl,
    };
  },
};
async function buildCreateTicketParams(args: CommandArguments, params: CommandParameters): Promise<object> {
  const basicParams = buildBasicRequestParams(WORKFLOWS.CREATE_TICKET);
  const release_version = extractVersion(args.branch);

  let latestReleaseLink = '';
  try {
    const latestRelease = await args.octokit.rest.repos.getLatestRelease(github.context.repo);
    latestReleaseLink = latestRelease.data.html_url;
  } catch (e) {
    latestReleaseLink = `https://github.com/${github.context.repo.owner}/${github.context.repo.repo}/releases/tag/0.0.0`;
  }

  return {
    ...basicParams,
    test: core.getBooleanInput('test') || params.test,
    product_jira_project_key: core.getInput('product_jira_project_key'),
    product_jira_version_prefix:
      core.getInput('product_jira_version_prefix') ||
      buildJiraVersionPrefix(basicParams.platform, basicParams.product, core.getInput('framework').toLowerCase()),
    release_branch: args.branch,
    release_version,
    release_gh_link: replaceVersion(latestReleaseLink, release_version),
    release_pr_number: github.context.issue.number,
    release_jira_version: buildReleaseJiraVersion(
      basicParams.platform,
      basicParams.product,
      release_version,
      core.getInput('framework').toLowerCase(),
    ),
    release_jira_ticket: buildReleaseJiraTicket(
      basicParams.platform,
      basicParams.product,
      release_version,
      core.getInput('framework').toLowerCase(),
    ),
    changelog_file: core.getInput('changelog_file') || 'CHANGELOG_DRAFT.md',
  };
}

function buildBasicRequestParams(workflowName: string): BasicRequestParams {
  return {
    [workflowName]: true,
    script_version: WORKFLOW_SCRIPT_VERSION,
    platform: core.getInput('platform').toLowerCase(),
    product: core.getInput('product').toLowerCase(),
    repo_name: github.context.repo.repo,
  };
}
