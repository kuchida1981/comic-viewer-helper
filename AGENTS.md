# Project Instructions (Single Source of Truth)

このファイルは、本リポジトリで作業するすべてのコーディングエージェント（Claude Code / Gemini CLI / その他）向けの共通指示・開発ワークフローの正本です。

## Project Information

- **Remote Repository**: `https://github.com/kuchida1981/comic-viewer-helper.git`
- **Owner**: `kuchida1981`
- **Repo Name**: `comic-viewer-helper`

## Architecture & Quality Standards

### Architecture Overview
- **Core Structure**:
  - `App`: Entry point and lifecycle management.
  - `Store`: Central state management.
  - `Managers`: Feature-specific logic (`Navigator`, `UIManager`, `ResumeManager`, etc.).
  - `Adapters`: Abstraction layer for site-specific DOM structures.
- **Logic Separation**:
  - `src/logic.ts`: Contains pure functions only. NO DOM dependencies allowed here.
  - DOM manipulations are encapsulated within Managers and Adapters.
- **Key Conventions**:
  - Right-to-left (RTL) navigation for manga:
    - Next: Left arrow key (`ArrowLeft`), `'j'` key, or click on the left side of the screen.
    - Previous: Right arrow key (`ArrowRight`), `'k'` key, or click on the right side of the screen.

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
- See `README.md` / `README.ja.md` for the developer guide

### Workflow Steps

1. **Review the GitHub Issue**
   - Understand the issue content provided by the user.
   - In some cases, you may create the issue yourself.

2. **Create an OpenSpec Proposal**
   - Create proposals for all features, refactoring, and bug fixes (use `openspec-propose` or `openspec-explore` skill when appropriate).
   - Collaborate with the user based on the issue content and obtain review before implementation.

3. **Create Topic Branch and Commit Proposal**
   - Create a topic branch for the change (GitHub Flow).
   - Commit the OpenSpec proposal files to that branch.

4. **Implement**
   - Implement the changes based on the OpenSpec proposal (use `openspec-apply-change` skill when appropriate) and commit the code.
   - Consider if `README.md` / `README.ja.md` or documentation updates are needed.
   - Run all quality checks before creating a PR:
     ```bash
     make all
     ```
     (`make all` executes `npm run test`, `npm run lint`, `npm run check-types`, `npx openspec validate --strict --all`, and `npm run build`).
   - Fix any failures before proceeding to PR creation.

5. **Create Pull Request**
   - Push the topic branch and create a pull request as a **draft** (`gh pr create --draft`).
   - Include a TODO checklist for user verification in the PR body.
   - Link the issue to the PR (e.g., `Closes #<issue-number>`).
   - Present the PR to the user and request verification.

6. **After Review and Verification**
   - After successful verification and code review, archive the OpenSpec proposal (use `openspec-archive-change` skill / `npx openspec archive <change-name>`).
   - Commit and push the archived files (do NOT include `dist/`).
   - Prompt the user to merge the PR.

### Important Rules

- **NEVER use `--no-verify` or `-n` flags**: Bypassing commit hooks is strictly prohibited. If checks fail, you MUST fix the underlying code or tests.
- **Do NOT use broad staging commands**: Never use `git add .` or `git add -A`. Always stage files individually or by specific paths to avoid including unintended files.
- **Check status before commit**: Always run `git status` before committing to verify staged changes.
- **Do NOT commit files in the `dist/` directory** (build artifacts are ignored by `.gitignore`).
- **Do NOT write production code before reaching the "implementation" step**.
- **Always include a TODO checklist for user verification in PR descriptions**.
- **Never skip user verification**.
- **`npx openspec validate --strict --all` validates all specs and active changes**: Unrelated failures in existing specs/changes also block validation and must be resolved (common causes: missing `specs/` without `skip_specs: true`, missing delta headers `## ADDED/MODIFIED/REMOVED Requirements`, or missing `#### Scenario:` blocks).
