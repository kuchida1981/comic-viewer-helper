# Tasks

## 1. SiteAdapter の作品ページ判定

- [ ] 1.1 `src/types.ts` の `SiteAdapter` に `isWorkPage(url: string): boolean` を追加し、`npm run check-types` で未対応の Adapter・テスト用モックが検出されることを確認する
- [ ] 1.2 `src/adapters/DefaultAdapter.ts` に `isWorkPage` を実装する（`/magazine/`・`/fanzine/` 配下、後続1文字以上、クエリ/ハッシュ無視）
- [ ] 1.3 `src/adapters/DefaultAdapter.test.ts` に、作品ページ・トップ・検索結果・`/magazine/` 単体・クエリ/ハッシュ付きのケースを追加し、テストが通ることを確認する
- [ ] 1.4 型エラーとなった既存テストのモック Adapter を修正し、`npm run test` と `npm run check-types` が通ることを確認する

## 2. リダイレクト判定の純粋関数

- [ ] 2.1 `src/logic.ts` に `resolveRedirectTarget`（`RedirectContext` を受け取り遷移先 URL か `null` を返す）を実装する
- [ ] 2.2 `src/logic.test.ts` に、spec の発動条件すべて（無効・作品ページ・リロード・戻る/進む・同一オリジンのリファラ・リファラなし・別オリジンのリファラ・履歴が空・`lastViewedAt` 最大の選択・現在 URL と同一・遷移先が作品ページでない・リファラのパース失敗）のケースを追加する
- [ ] 2.3 `npm run test` で `src/logic.ts` のカバレッジが 100% のままであることを確認する

## 3. 設定（ON/OFF）

- [ ] 3.1 `src/store.ts` に `isRedirectEnabled`（デフォルト `false`）と `STORAGE_KEYS.REDIRECT_ENABLED` を追加し、`GM_getValue`/`GM_setValue` による読み込み・永続化を実装する。`syncableKeys` には含めない
- [ ] 3.2 `src/store.test.ts` に、デフォルト値・永続化・再読み込みのテストを追加し、通ることを確認する
- [ ] 3.3 `src/i18n.ts` に ON/OFF 設定の文言（日英）を追加し、`src/i18n.test.ts` が通ることを確認する
- [ ] 3.4 `UIManager` の設定領域（`SyncSettings` 付近）に ON/OFF チェックボックスのコンポーネントを追加し、操作で `isRedirectEnabled` が更新されることをテストで確認する

## 4. リダイレクトの実行とブートストラップ

- [ ] 4.1 `src/managers/RedirectManager.ts` を新規作成する（`Store`・`document.referrer`・`performance.getEntriesByType('navigation')` を集めて `resolveRedirectTarget` を呼び、結果があれば `location.replace` する）
- [ ] 4.2 `src/managers/RedirectManager.test.ts` に、遷移する場合・しない場合・履歴が空の場合のテストを追加し、`location.replace` の呼び出しを検証する
- [ ] 4.3 `src/main.ts` を変更し、Adapter 選択を `App` の外へ移して `adapter.isWorkPage(location.href)` で分岐する（作品ページ以外は `RedirectManager.run()` のみ、作品ページは従来どおり `App`）。`App` が Adapter を受け取れるようコンストラクタを調整する
- [ ] 4.4 `document-start` で `App` のコンストラクタが DOM に触れないことを確認する（触れる場合は `init()` へ移す）。`npm run test` が通ることを確認する

## 5. ヘッダー・ドキュメント

- [ ] 5.1 `src/header.ts` の `@match` を `https://something/*` の1行にし、`@run-at` を `document-start` に変更する。`make build` で出力されるユーザースクリプトのヘッダーを確認する
- [ ] 5.2 `README.md`・`README.ja.md` の `@match` 説明を更新し、リダイレクト機能（デフォルト OFF）の説明を追加する。記載内容がヘッダーの実態と一致していることを確認する

## 6. 統合確認

- [ ] 6.1 `make all` を実行し、すべてのチェック（test, lint, typecheck, docs, build）が成功することを確認する
- [ ] 6.2 ビルド成果物を Tampermonkey に導入し、PR の確認チェックリスト（外部から作品ページ以外を開く、サイト内遷移、履歴が空、リロード、戻る、再開通知、ON/OFF、ちらつき）を実機で確認する

## Workflow follow-up

- ユーザーの確認とレビュー完了後に、OpenSpec チェンジをアーカイブして push する。
