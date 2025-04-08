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

  const params = getCommandParams(paramCandidates);

  if (params.ci === 'circleci' && !args.circleci_token) {
    core.warning('BuildCommand: CircleCI token is not provided');
  }

  switch (action) {
    case COMMAND_ACTIONS.CREATE:
      return new CreateCommand(target, args, params);
    default:
      return null;
  }
}

export function getCommandParams(paramCandidates: string[]): CommandParameters {
  return paramCandidates
    .filter((it) => it.startsWith(COMMAND_PARAM_PREFIX))
    .map((it) => it.replace(COMMAND_PARAM_PREFIX, ''))
    .map((it) => it.split('='))
    .reduce<CommandParameters>(
      (acc, [key, value = true]) => ({ ...acc, [key]: parseValue(value) }),
      COMMAND_DEFAULT_PARAMS,
    );
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
