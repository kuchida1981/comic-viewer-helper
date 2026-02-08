# Project Instructions for Gemini CLI

## Project Information

- **Remote Repository**: `https://github.com/kuchida1981/comic-viewer-helper.git`
- **Owner**: `kuchida1981`
- **Repo Name**: `comic-viewer-helper`

## Architecture & Quality Standards

### Architecture Overview
- **Core Structure**:
  - `App`: Entry point and lifecycle management.
  - `Store`: Central state management.
  - `Managers`: Feature-specific logic (Navigator, UIManager, ResumeManager, etc.).
  - `Adapters`: Abstraction layer for site-specific DOM structures.
- **Logic Separation**:
  - `src/logic.ts`: Contains pure functions only. NO DOM dependencies allowed here.
  - DOM manipulations are encapsulated within Managers and Adapters.

### Quality Standards
- **Testing**: Maintain **100% coverage** for core logic (`src/logic.ts`).
- **Type Safety**: Strict TypeScript usage. Avoid `any`.
- **Specification**: All changes must follow the OpenSpec workflow (Requirement/Scenario based).

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
   - Push the topic branch and create a pull request as a **draft**.
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
- **Do NOT commit files in the `dist/` directory** (build artifacts are ignored by `.gitignore`)
- **Do NOT write production code before reaching the "implementation" step**
- **Always include a TODO checklist for user verification in PR descriptions**
- **Never skip user verification**
- **Run all checks before PR**: Before creating a pull request or reporting implementation completion, you MUST run and pass all of the following checks locally:
  - `npm run test` (Tests & Coverage)
  - `npm run lint` (Linting)
  - `npm run check-types` (Type Checking)
  - `npm run build` (Build process)
  - `npx openspec validate --strict --all` (OpenSpec verification)
