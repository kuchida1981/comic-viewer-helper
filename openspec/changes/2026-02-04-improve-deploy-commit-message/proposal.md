# Proposal: Improve CI Deploy Commit Message

## Problem
Currently, the commit message for automated deployments to `stable` and `unstable` branches is a generic, auto-generated string (e.g., "Deploying to unstable from..."). This makes it difficult to understand what changes are included in a specific deployment without manually cross-referencing with the source branch history.

## Proposed Solution
Enhance the CI deployment workflow to generate a more descriptive and informative commit message for the deployment commit. The new message should include:
1. The subject line (summary) of the original commit that triggered the build.
2. The body (description) of the original commit.
3. Metadata about the deployment (source repository, commit SHA, actor, and event type).

## Expected Outcomes
- **Improved Traceability**: Developers can easily see what was changed in a specific deployment directly from the `stable`/`unstable` branch history.
- **Better Debugging**: Quickly identify which build introduced a bug by reading the descriptive commit logs.
- **Enhanced Transparency**: Provides a clearer audit trail of what has been deployed and why.

## Design Considerations
- Use `git log` to extract the original commit message during the GitHub Actions workflow.
- Pass the formatted message to the `JamesIves/github-pages-deploy-action` via its `commit-message` input.
- Handle cases where the commit message might be empty or multi-line (standard for Git commits).
