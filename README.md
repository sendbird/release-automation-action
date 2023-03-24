# release-comment-action

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
      - uses: sendbird/release-comment-action@version
        with:
          gh_token: ${{ secrets.GITHUB_TOKEN }}
          circleci_token: ${{ secrets.CIRCLECI_TOKEN }}
          product: 'uikit'
          platform: 'rn'
```

Replace version with the version of the action you want to use.

Make sure to set the required secrets `CIRCLECI_TOKEN` and `GITHUB_TOKEN` in the repository settings.

## Inputs

The action requires the following inputs:

| name           | description                                                           | default | required |
| -------------- | --------------------------------------------------------------------- | ------- | -------- |
| circleci_token | The CircleCI API token used to trigger the build and deploy workflow. | N/A     | true     |
| gh_token       | The GitHub API token used to authenticate the Octokit instance.       | N/A     | true     |
| product        | The product name, e.g., chat, uikit, calls.                           | N/A     | true     |
| platform       | The platform name, e.g., android, ios, js, rn, flutter.               | N/A     | true     |

## Commands

You can use the following commands in the PR comment:

| command              | description                           |
| -------------------- | ------------------------------------- |
| `/bot ticket create` | Creates a new release ticket in Jira. |
