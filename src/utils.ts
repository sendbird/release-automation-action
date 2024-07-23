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
  if (match) return match[3]
  return ''
}

export function replaceVersion(link: string, version: string): string {
  const pattern = /(\d+\.\d+\.\d+)\D*/
  const match = pattern.exec(link)

  if (!match) return link

  const target = match[1]
  return link.replace(target, version)
}

export function buildProductJiraVersion(
  platform: string,
  product: string
): string {
  // {product}-{platform}[-{framework}]?
  // chat-ios, chat-android, live-uikit-js-react, uikit-js-react

  return `${product}-${platform}`
}

export function buildReleaseJiraVersion(
  platform: string,
  product: string,
  version: string,
  framework = ''
): string {
  // {product}-{platform}[-{framework}]?@{version}
  // live-uikit-js-react@0.0.0, chat-ios@0.0.0

  const platformAndFramework = platformWithFramework(platform, framework)
  return `${product}-${platformAndFramework}@${version}`
}

export function buildReleaseJiraTicket(
  platform: string,
  product: string,
  version: string,
  framework = ''
): string {
  // [{product}]{platform}[-{framework}]?@{version}
  // [Live-UIKit] js-react@0.0.0, [Chat] ios@0.0.0

  const platformAndFramework = platformWithFramework(platform, framework)
  return `[${capitalizeProduct(product)}] ${platformAndFramework}@${version}`
}

function platformWithFramework(platform: string, framework?: string): string {
  return platform + (framework ? `-${framework}` : '')
}

function capitalizeProduct(str?: string): string {
  if (!str) return ''
  if (str === 'uikit') return 'UIKit'
  if (str === 'live_uikit' || str === 'live-uikit') return 'Live-UIKit'
  return capitalize(str)
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

function getVersionRegex(inputs: string[]): RegExp {
  const joinedInputs = inputs.join('|')
  // release/0.0.0
  // release/ktx/0.0.0
  // release/compose/0.0.0-beta.0
  return new RegExp(
    `^(${joinedInputs})(\\/\\w+)*\\/v?(\\d+\\.\\d+\\.\\d+([\\-\\.]\\w+\\.\\d+)*)$`
  )
}
