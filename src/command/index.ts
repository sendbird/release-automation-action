import type {Command, CommandArguments} from './command'
import {COMMAND_TRIGGER} from '../constants'
import CreateCommand from './command.create'

export function buildCommand(
  text: string,
  args: CommandArguments
): Command | null {
  if (!text.startsWith(COMMAND_TRIGGER) || !args.isPRComment) return null

  const [action, target] = text.replace(COMMAND_TRIGGER, '').trim()
  switch (action) {
    case 'create':
      return new CreateCommand(target, args)
    default:
      return null
  }
}
