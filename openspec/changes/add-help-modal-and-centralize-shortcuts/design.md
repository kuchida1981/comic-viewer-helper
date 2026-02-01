## Context

機能追加（見開きトグル、オフセット、メタデータ表示など）に伴い、利用可能なキーボードショートカットが増加しています。現在、これらの定義は `App.prototype.onKeyDown` 内にハードコードされており、ユーザーが一覧を確認する手段がなく、また開発者が新しいショートカットを追加する際の説明の更新漏れが発生しやすい状態にあります。

## Goals / Non-Goals

**Goals:**
- ショートカットキー、説明、およびアクションを一元管理するデータ構造の導入。
- 利用可能な操作を一覧表示するヘルプモーダルの実装。
- ナビゲーションパネルへのヘルプ起動用GUIボタン（`?`）の追加。
- `?` キーによるヘルプ表示のトグル。

**Non-Goals:**
- ショートカットのユーザーカスタマイズ機能の実装（今回は固定の定義を前提とする）。
- マウスジェスチャーなど、キーボード以外の入力拡張。

## Decisions

### 1. ショートカット定義の一元管理
- **Decision**: `src/shortcuts.js` を新規作成し、ショートカットの定義を一括して保持する。
- **Rationale**: `main.js`（実行ロジック）と `HelpModal.js`（表示ロジック）の両方から参照可能にするため。
- **Data Structure**:
  ```javascript
  export const SHORTCUTS = [
    { label: 'Next Page', keys: ['j', 'ArrowDown', 'PageDown', 'ArrowRight', 'Space'], description: '次のページへ移動' },
    // ...
  ];
  ```

### 2. HelpModal の実装
- **Decision**: `MetadataModal` と同様の `createElement` ベースのコンポーネントとして実装する。
- **Rationale**: プロジェクトの既存パターン（バニラJS + ユーティリティ関数）に従い、一貫性を保つため。
- **UI Structure**: キーと説明を左右に並べたリスト形式。

### 3. App クラスとの統合
- **Decision**: `onKeyDown` ハンドラを、定義データに基づいた動的なディスパッチではなく、定義データを「参照」して説明を表示し、ロジック自体は明示的に記述する方式を維持しつつ、共通化を図る。
- **Rationale**: キーの組み合わせ（Shiftの有無など）や複雑な条件（`isDualViewEnabled` 時のみなど）をデータだけで表現すると複雑になりすぎるため、まずは「定義（キーと説明）」を共有することに注力する。

### 4. モーダルのスタック管理
- **Decision**: `HelpModal` と `MetadataModal` は排他的に表示するか、重ねて表示するかを検討。
- **Rationale**: 簡略化のため、新しいモーダルを開く際は既存のモーダルを閉じる、またはトップレベルで一つだけモーダル状態を管理する。

## Risks / Trade-offs

- [Risk] モーダル表示中に他のショートカットが反応してしまう。
  - → Mitigation: `store` に `isHelpModalOpen` 状態を追加し、`onKeyDown` の冒頭でガードを設ける（既存の `isMetadataModalOpen` と同様）。
- [Risk] ショートカットのキーがサイト固有の挙動と衝突する。
  - → Mitigation: 既存の `isInputField` ガードを継続して使用し、入力中は反応しないようにする。
