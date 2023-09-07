import {CommandParameters} from './command/command'

export const COMMAND_TRIGGER = '/bot'
export const COMMAND_ACTIONS = {
  CREATE: 'create'
}
export const COMMAND_TARGETS = {
  TICKET: 'ticket'
}
export const COMMAND_PARAM_PREFIX = '--'

export const BRANCH_RELEASE_PREFIX = 'release'
export const BRANCH_HOTFIX_PREFIX = 'hotfix'

export const WORKFLOW_REPO = 'sendbird/sdk-deployment'
export const WORKFLOW_SCRIPT_VERSION = 'v1.2'
export const WORKFLOWS = {
  CREATE_TICKET: 'run_workflow_create_ticket'
}

export const SENDBIRD_BOT_USERNAME = 'sendbird-sdk-deployment'
export const COMMAND_DEFAULT_PARAMS: CommandParameters = {
  test: false
}
