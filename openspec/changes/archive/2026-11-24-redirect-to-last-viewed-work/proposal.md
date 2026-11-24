# Proposal

## Why

現在の `@match` は作品ページ（`/magazine/*`, `/fanzine/*`）のみを対象としているため、トップや検索結果など作品ページ以外を開いたときにスクリプトは何もしない。ブックマークや URL 直打ちでサイトを開いたとき、前回読んでいた作品にすぐ戻れるようにしたい（Issue #273）。

## What Changes

- 作品ページ以外を開いたとき、最後に閲覧した作品の URL へリダイレクトする機能を追加する（`location.replace` を使用し、履歴にリダイレクト元を残さない）。
- 遷移先の作品ページでは、既存の再開通知（ResumeManager / `resume-notification`）により前回のページ位置へ戻れる。ページ位置の自動ジャンプは行わない。
- `SiteAdapter` に作品ページ判定 `isWorkPage(url)` を追加する。パスの判定ルールはコアに持たず、各 Adapter が定義する。`DefaultAdapter` は既存の `@match` と同じ `/magazine/*`・`/fanzine/*` を作品ページとする。
- リダイレクトの発動条件を純粋関数で判定する（`src/logic.ts`）。次の場合は発動しない。
  - 機能が OFF
  - 現在のページが作品ページ
  - サイト内遷移（同一オリジンからの遷移）、リロード、ブラウザの戻る/進む
  - 履歴が空
  - 遷移先が現在の URL と同じ、または遷移先が作品ページではない
- ON/OFF 設定を追加する。デフォルトは OFF。
- `@match` を `https://something/*`（ドメイン単位）に広げ、`@run-at` を `document-start` に変更する（リダイレクト時のちらつきを避けるため）。作品ページ以外では `App` を初期化せず、リダイレクト処理のみ実行する。
- README の `@match` に関する記述を更新する。

## Capabilities

### New Capabilities
- `last-viewed-redirect`: 作品ページ以外を開いたときに、最後に閲覧した作品へ自動遷移する機能。発動条件・誤爆/ループ防止・ON/OFF 設定の永続化を扱う。

### Modified Capabilities
- `site-adapter`: アダプターが URL に対して「作品ページかどうか」を判定する能力を提供する要件を追加する。

## Impact

- `src/header.ts`: `@match` のドメイン単位化、`@run-at document-start`。
- `src/types.ts`: `SiteAdapter` に `isWorkPage(url)` を追加。
- `src/adapters/DefaultAdapter.ts`: `isWorkPage` の実装。
- `src/logic.ts`: リダイレクト先の決定（純粋関数）。100% カバレッジ維持が必要。
- `src/main.ts`: Adapter 選択を `App` の外へ移し、作品ページ以外ではリダイレクト処理のみを実行。
- `src/managers/RedirectManager.ts`（新規）: DOM/GM ストレージとリダイレクト実行の橋渡し。
- `src/store.ts` / `src/types.ts`: ON/OFF 設定の状態と永続化キーの追加。
- `src/ui/`・`src/i18n.ts`: 設定 UI（ON/OFF）と日英の文言。
- `README.md` / `README.ja.md`: `@match` 設定の説明更新。
- 既存の再開機能（`ResumeManager`）と閲覧履歴（`luckyHistory`）は変更せず再利用する。
