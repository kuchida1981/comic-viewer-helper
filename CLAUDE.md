# Project Instructions for Claude Code

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
   - 実装コミットの後、以下の全工程を経て全てが緑になることを確認してからPRに進む（いずれかが失敗した場合は修正してから再実行する）:
     ```
     npm run test
     npm run lint
     npm run check-types
     openspec validate --strict --all
     IS_UNSTABLE=true npm run build
     ```

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

- **Do NOT use broad staging commands**: Never use `git add .` or `git add -A`. Always stage files individually or by specific paths to avoid including unintended files.
- **Check status before commit**: Always run `git status` before committing to verify staged changes.
- **Do NOT write production code before reaching the "implementation" step**
- **Always include a TODO checklist for user verification in PR descriptions**
- **Never skip user verification**
- **`openspec validate --strict --all` は全チャンジを対象とする**: 自分のチャンジ以外の既存チャンジも検証される。失敗したチャンジは今回の変更とは無関係であっても修正が必要。一般的な原因は `specs/` が存在しないか、デルタヘッダ（`## ADDED/MODIFIED/REMOVED Requirements`）やシナリオ（`#### Scenario:`）が不足していること。
