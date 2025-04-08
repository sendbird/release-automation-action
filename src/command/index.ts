import * as core from '@actions/core';
import type { Command, CommandArguments, CommandParameters } from './command';
import { COMMAND_ACTIONS, COMMAND_DEFAULT_PARAMS, COMMAND_PARAM_PREFIX, COMMAND_TRIGGER } from '../constants';
import CreateCommand from './command.create';

export function buildCommand(text: string, args: CommandArguments): Command | null {
  if (!text.startsWith(COMMAND_TRIGGER) || !args.isPRComment) {
    core.info('BuildCommand: Invalid command or not a PR comment');
    return null;
  }

  const [action, target, ...paramCandidates] = text.replace(COMMAND_TRIGGER, '').trim().split(' ');

  const params = getCommandParams(paramCandidates, {
    ci: core.getInput('ci') as 'github' | 'circleci',
    test: core.getBooleanInput('test'),
  });

  if (params.ci !== 'circleci' && params.ci !== 'github') {
    core.setFailed('Invalid CI type. Please use "circleci" or "github".');
    throw new Error('Invalid CI type');
  }

  if (params.ci === 'circleci' && !args.circleci_token) {
    core.setFailed('CircleCI token is not provided');
    throw new Error('CircleCI token is not provided');
  }

  switch (action) {
    case COMMAND_ACTIONS.CREATE:
      return new CreateCommand(target, args, params);
    default:
      return null;
  }
}

export function getCommandParams(paramCandidates: string[], core?: Partial<CommandParameters>): CommandParameters {
  const params = paramCandidates
    .filter((it) => it.startsWith(COMMAND_PARAM_PREFIX))
    .map((it) => it.replace(COMMAND_PARAM_PREFIX, ''))
    .map((it) => it.split('='))
    .reduce<CommandParameters>(
      (acc, [key, value = true]) => ({ ...acc, [key]: parseValue(value) }),
      COMMAND_DEFAULT_PARAMS,
    );

  return {
    test: core?.test || params.test || false,
    ci: core?.ci || params.ci || 'circleci',
  };
}

function parseValue(value: boolean | string): boolean | string {
  if (value === 'true') {
    return true;
  }
  if (value === 'false') {
    return false;
  }
  return value;
}
