# Project Instructions for Gemini CLI

## Language

The user is a Japanese speaker.
Always respond in Japanese unless the user explicitly requests another language.
Do not switch to English automatically, even for technical explanations.

## Development Workflow

This project follows a structured development workflow. Follow these rules strictly.
Do not skip steps unless the user explicitly instructs otherwise.

### Prerequisites

- Use GitHub Flow
- Default branch is `master`
- GitHub issues drive development
- Create OpenSpec proposals, review, then implement
- User verification is required before merging
- See README for developer guide

### Workflow Steps

1. **Review the GitHub Issue**
   - Understand the issue content provided by the user
   - In some cases, you may create the issue yourself

2. **Create an OpenSpec Proposal**
   - Create proposals for all features, refactoring, and bug fixes
   - Collaborate with the user based on the issue content

3. **Create Topic Branch and Commit Proposal**
   - Create a topic branch for the change (GitHub Flow)
   - Commit the OpenSpec proposal files to that branch

4. **Implement**
   - Implement the changes and commit the code
   - Consider if README or documentation updates are needed

5. **Create Pull Request**
   - Push the topic branch and create a pull request
   - Include a TODO checklist for user verification in the PR body
   - Present the PR to the user and request verification
   - Link the issue to the PR

6. **After Review and Verification**
   - After successful verification and code review, verify/archive the OpenSpec proposal
   - Commit and push
   - Prompt the user to merge the PR

### Important Rules

- **Do NOT commit files in the `dist/` directory** (build artifacts are ignored by `.gitignore`)
- **Do NOT write production code before reaching the "implementation" step**
- **Always include a TODO checklist for user verification in PR descriptions**
- **Never skip user verification**
