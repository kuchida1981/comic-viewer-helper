## Why

検索モーダルで入力したキーワードの検索結果を、ページ遷移せずGUI内で確認できるようにする。
現状はキーワード入力後にサイトの検索結果ページへリダイレクトされるため、閲覧途中の状態が失われる。

## What Changes

- 検索モーダルのサブミット動作を `window.location.href` へのリダイレクトから `fetch` による非同期取得に変更
- レスポンスのHTMLを `DOMParser` でパースし、検索結果（タイトル・サムネイル・コンテンツURL）を抽出
- 検索結果の件数を抽出し、モーダル内で表示
- モーダル内にグリッド表示で検索結果を一覧示す（`MetadataModal` の関連作品グリッドと同じパターン）
- 次ページが存在する場合、「もっと見る」リンクを表示し、対象サイトの検索結果ページに遷移
- `DefaultAdapter` に `parseSearchResults(doc: Document)` メソッドを追加し、パースロジックをアダプター側で定義
- `SearchResult` 型を新規定義（`title`, `href`, `thumb`）

## Capabilities

### New Capabilities
- `search-results-display`: 検索結果の取得・パース・グリッド表示・件数表示・もっと見る機能

### Modified Capabilities
- `search-interface`: 検索実行動作がリダイレクトからfetch＋モーダル内表示へ変更される
- `site-adapter`: アダプターが提供する機能にHTMLパース（検索結果抽出）が追加される

## Impact

- `src/ui/components/SearchModal.ts`: サブミット動作の変更と検索結果表示の追加
- `src/adapters/DefaultAdapter.ts`: `parseSearchResults` メソッドの追加
- `src/types.ts`: `SearchResult` 型の追加
- `src/ui/styles.ts`: 検索結果グリッド・もっと見る用スタイルの追加（レイアウト値は関連作品グリッドと同じパターンだが、クラス名は独立: `search-result-grid`, `search-result-item` 系）
- `src/managers/UIManager.ts`: 検索結果データの状態管理と渡し方の調整
- `src/store.ts`: 検索結果データを保持するステートの追加