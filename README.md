# release-automation-action

This GitHub Action is designed to be used as a comment bot in a release automation process.

When an PR comment is created, the action will check if the comment contains a specific command and then execute an action based on the command.
If the conditions are met, the script extracts a command from the comment and runs it.

## Usage

To use this action, create a new workflow in your GitHub repository that listens for issue_comment events, but only for Pull Request comments.

Then, add the following step to the workflow:

```yaml
name: PR Comment Bot
on:
  issue_comment:
    types: [created]
jobs:
  pr-comment:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: sendbird/release-automation-action@version
        with:
          gh_token: ${{ secrets.GITHUB_TOKEN }}
          circleci_token: ${{ secrets.CIRCLECI_TOKEN }}
          product: 'uikit'
          platform: 'rn'
          product_jira_project_key: 'UIKIT'
          product_jira_version_prefix: 'rn_uikit'
```

Replace version with the version of the action you want to use.

Make sure to set the required secret CircleCI API token in the repository settings.

## Inputs

The action requires the following inputs:

| name                          | description                                                                                               | required |
| ----------------------------- | --------------------------------------------------------------------------------------------------------- | -------- |
| `gh_token`                    | The GitHub access token used to authenticate with the Octokit instance.                                   | Yes      |
| `circleci_token`              | The CircleCI API token used to trigger the build and deploy workflow.                                     | Yes      |
| `product`                     | The name of the product's SDK, such as `chat`, `calls`, `uikit`, `live`, or `live_uikit`.                 | Yes      |
| `platform`                    | The platform for the product's SDK, such as `ios`, `android`, `js`, `rn`, or `flutter`.                   | Yes      |
| `framework`                   | (Optional) The framework for the product's SDK, such as `react`.                                          | No       |
| `product_jira_project_key`    | The project key for the product's Jira project, such as `CORE`, `UIKIT`, `CALLS`, or `PLATFORMX`.         | Yes      |
| `product_jira_version_prefix` | The release version prefix for the product's Jira project, such as `ios_core`, `rn_uikit`, or `js_uikit`. | Yes      |
| `test`                        | Ticket creation and slack alerts are executed in the test environment (release board, slack channel).     | No       |

## Commands

You can use the following commands in the PR comment:

| command              | description                           |
| -------------------- | ------------------------------------- |
| `/bot create ticket` | Creates a new release ticket in Jira. |
