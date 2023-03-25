import {BRANCH_HOTFIX_PREFIX, BRANCH_RELEASE_PREFIX} from './constants'

export function isReleaseBranch(branch: string): boolean {
  return [BRANCH_RELEASE_PREFIX, BRANCH_HOTFIX_PREFIX].some(prefix =>
    branch.startsWith(prefix)
  )
}

export function extractVersion(branch: string): string {
  const versionRegex = getVersionRegex([
    BRANCH_RELEASE_PREFIX,
    BRANCH_HOTFIX_PREFIX
  ])
  const match = branch.match(versionRegex)
  if (match) return match[2]
  return ''
}

export function buildReleaseJiraVersion(
  platform: string,
  product: string,
  version: string,
  framework = ''
): string {
  // {platform}[_{framework}]?_{product}@{version}
  // js_react_live_uikit@0.0.0, ios_chat@0.0.0

  const name = platformWithFramework(platform, framework)
  return `${name}_${product}@${version}`
}

export function buildReleaseJiraTicket(
  platform: string,
  product: string,
  version: string,
  framework = ''
): string {
  // [{product}]{platform}[_{framework}]?@{version}
  // [Live_uikit] js_react@0.0.0, [Chat] ios@0.0.0

  const name = platformWithFramework(capitalize(platform), framework)
  return `[${capitalize(product)}] ${name}@${version}`
}

function platformWithFramework(platform: string, framework?: string): string {
  return platform + (framework ? `_${framework}` : '')
}

function capitalize(str?: string): string {
  if (!str) return ''
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getVersionRegex(inputs: string[]): RegExp {
  const joinedInputs = inputs.join('|')
  return new RegExp(`(${joinedInputs})\\/v?(\\d+\\.\\d+\\.\\d+)`)
}