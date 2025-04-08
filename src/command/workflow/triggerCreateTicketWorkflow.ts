import type { CommandArguments } from '../command';
import { WORKFLOW_REPO } from '../../constants';
import fetch from 'node-fetch';
import * as core from '@actions/core';

type Params = {
  args: CommandArguments;
  parameters: object;
  ci: 'github' | 'circleci';
  test: boolean;
  repository?: string;
};

type Response = {
  workflowUrl: string;
  repository: string;
};

export const triggerCreateTicketWorkflow = async ({
  args,
  parameters,
  ci,
  test,
  repository = WORKFLOW_REPO,
}: Params): Promise<Response> => {
  if (ci === 'github') {
    return requestToGitHubActions({ args, parameters, ci, repository, test });
  }

  if (ci === 'circleci') {
    if ('ci' in parameters) delete parameters.ci;

    return requestToCircleCI({ args, parameters, ci, repository, test });
  }

  throw new Error(`Invalid CI type: ${ci}`);
};

async function requestToCircleCI({ args, parameters, repository }: Required<Params>): Promise<Response> {
  const response = await fetch(`https://circleci.com/api/v2/project/gh/${repository}/pipeline`, {
    method: 'POST',
    headers: {
      'Circle-Token': args.circleci_token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ parameters }),
  });

  const data = await response.json();

  if (data.message === 'Project not found') {
    core.warning(
      'Please check first, valid token has been provided to CI' +
        "\nIf not, it looks like sendbird org authorize on the bot's GitHub account has been broken." +
        "\n1. Please SSO log in and re-authenticate using bot's GitHub account" +
        '\n2. https://app.circleci.com/settings/user > Refresh permissions',
    );
    throw new Error("Bot's GitHub account seems not authorized to organization");
  }

  if (data.message === 'Permission denied') {
    core.warning(
      "It looks like bot can't access to project" +
        '\n1. Please add bot as a admin to the GitHub project and add User Key in CircleCI Settings > SSH Keys' +
        '\n2. https://github.com/settings/keys > Configure SSO > Authorize',
    );
    throw new Error('Bot is unable to access the project');
  }

  return {
    repository,
    workflowUrl: `https://app.circleci.com/pipelines/github/${repository}/${data.number}`,
  };
}

async function requestToGitHubActions({ args, parameters, test, repository }: Required<Params>): Promise<Response> {
  const [owner, repo] = repository.split('/');
  const workflow_id = 'create-ticket.yml';

  await args.octokit.rest.actions.createWorkflowDispatch({
    owner,
    repo,
    workflow_id,
    ref: 'main',
    inputs: {
      test: String(test),
      data: JSON.stringify(parameters),
    },
  });

  return {
    repository,
    workflowUrl: `https://github.com/sendbird/sdk-deployment/actions/workflows/${workflow_id}`,
  };
}
