## Why
Step 1 (#122) で実装された検索機能を、マウスを使わずにキーボード操作だけで素早く起動できるようにするためです。YouTubeやGitHubなどの主要なサービスで採用されている標準的な `/` キーによる検索開始をサポートすることで、ユーザー体験（UX）を向上させます。

## What Changes
- キーボードの `/` キーを押した際に、検索モーダルを表示する機能を追加します。
- すでに `SearchModal` でオートフォーカスが実装されているため、状態変更のみでスムーズに入力を開始可能にします。
- テキスト入力中（`input`, `textarea` 等）に `/` キーを押してもモーダルが開かないように、フォーカス状態に応じた競合制御を実装します。
- ヘルプモーダルに新しいショートカット情報を追加します。

## Capabilities

### New Capabilities
- `search-shortcut`: `/` キーによる検索モーダルの起動と、入力中のイベント抑制を管理する機能。

### Modified Capabilities
- `search-interface`: 検索モーダルの表示トリガーとしてキーボードショートカットを追加。
- `help-display`: 検索ショートカットの情報を表示内容に追加。

## Impact
- `src/shortcuts.ts` および `src/managers/InputManager.ts`: ショートカットの定義とハンドリングの追加。
- `src/store.ts`: 検索状態の管理。
- `src/ui/components/HelpModal.ts`: ショートカット一覧への項目追加。
