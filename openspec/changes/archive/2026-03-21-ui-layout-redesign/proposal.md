## Why
現在のメインUIはすべてのコントロールが横一列に並んでおり、機能追加に伴い画面の横幅を大きく占有してしまっています。これにより、特に画面幅の狭い環境での操作性が低下し、画面の視認性を妨げる要因となっています。

## What Changes
- メインUI（コントロールパネル）を1行から2行構成のレイアウトに刷新します。
- コントロールを論理的なグループ（ナビゲーション、設定、ツール）に分割し、整理します。
- 一部のテキストラベル（作品情報、ヘルプ等）をアイコンに置き換え、よりコンパクトにします。
- レスポンシブ対応として、画面幅に応じて要素が適切に折り返されるようにします。

## Capabilities

### New Capabilities
- `ui-layout-management`: 複数行のコントロールパネル配置とレスポンシブな折り返しを管理する機能。

### Modified Capabilities
- `navigation-control`: ナビゲーションボタンの配置とUI構造の変更。
- `gui-visibility-control`: UIパネル全体のレイアウト構造の変更。
- `spread-adjustment`: 見開き設定コントロールの配置変更。
- `autoplay-control`: オートプレイコントロールの配置変更。
- `search-interface`: 検索ボタンの配置変更。
- `favorites-management`: お気に入りボタンの配置変更。
- `help-display`: ヘルプボタンの配置変更。
- `metadata-view`: 作品情報ボタンの配置変更。

## Impact
- `src/ui/styles.ts`: レイアウト用のCSSクラス（`.comic-helper-row`等）の追加と、既存の `#comic-helper-ui` のスタイル変更。
- `src/managers/UIManager.ts`: UIコンポーネントをグループ化してDOMに追加するロジックの変更。
- `src/ui/components/NavigationButtons.ts`: ボタン群を分割して返せるようにインターフェースを変更。
- `src/ui/components/`: 各コンポーネントの微細なスタイル調整。
