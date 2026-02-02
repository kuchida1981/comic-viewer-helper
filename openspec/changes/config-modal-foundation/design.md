## Context

現在、見開き表示の切り替え（`d`キー）やGUI位置の保存は個別に実装されており、設定値は `localStorage` に分散して保存されています。今後のカスタマイズ項目の増加に備え、統合的な設定管理の基盤が必要です。

既存のモーダル実装（`HelpModal`、`MetadataModal`）と統一されたパターンで、設定モーダルを追加します。

## Goals / Non-Goals

**Goals:**
- 統合設定モーダル（ConfigModal）を実装し、既存モーダルと統一されたデザインを提供する
- Store を拡張し、GUI位置モード（記憶/固定）を管理する
- 設定変更を即時反映する（リアクティブ）
- 将来的な設定項目の追加を容易にする拡張性を確保する

**Non-Goals:**
- 既存の見開き表示やGUI位置保存のロジックを大幅にリファクタリングすること
- 設定のインポート/エクスポート機能
- 設定のバリデーション（現時点では基本的な値のみ）
- 複雑な設定グループ化や検索機能

## Decisions

### 1. Store の拡張方針

**決定**: 既存の Store クラスに `guiPositionMode` と `isConfigModalOpen` を追加する

**理由**:
- 既存のパターン（`isDualViewEnabled`、`isHelpModalOpen` など）との一貫性
- リアクティブ性が既に確立されている
- 新しいストア管理システムを導入する必要がない

**代替案**:
- 別の設定専用ストアを作成 → オーバーエンジニアリングになる可能性

### 2. GUI位置モードの実装方法

**決定**: `setState` 内で `guiPositionMode` の値を確認し、条件付きで `localStorage` に保存する

```javascript
if ('guiPos' in patch) {
  if (this.state.guiPositionMode === 'remember') {
    localStorage.setItem(STORAGE_KEYS.GUI_POS, JSON.stringify(patch.guiPos));
  }
  // 'fixed' モードの場合は保存しない
}
```

**理由**:
- Draggable クラスや UIManager の既存コードを変更する必要がない
- Store の責務（状態管理と永続化）に集約される
- 設定変更時の影響範囲が明確

**代替案**:
- Draggable クラスに保存判定ロジックを追加 → 責務が分散する
- UIManager で保存を制御 → Store の永続化ロジックが分散する

### 3. 固定位置の座標

**決定**: 画面右下に固定（`top: innerHeight - 150, left: innerWidth - 220`）

**理由**:
- ユーザーの視線の邪魔にならない位置
- ウィンドウリサイズ時に既存の `Draggable.clampToViewport()` が適用される
- 将来的に四隅選択に拡張する場合も、同じパターンで実装可能

### 4. モード切り替え時の動作

**決定**: 設定変更時点ではGUIを移動せず、次回ページ表示時から反映する

**理由**:
- ユーザーが現在の位置を保持したまま設定を試せる
- ドラッグは常に許可されているため、即座に移動する必要はない
- 実装がシンプル（UIManager の `init()` で初期位置を決定するだけ）

**代替案**:
- 即座に固定位置に移動 → ユーザーが驚く可能性がある
- ドラッグを禁止する → 不要に複雑で、ユーザー体験を損なう

### 5. 設定反映のタイミング

**決定**: 即時反映（設定変更時に即座にStoreを更新）

**理由**:
- 既存の見開き表示トグル（`d`キー）と一貫性がある
- Store のリアクティブ性により、自動的にUIが更新される
- ユーザーが設定の効果をすぐに確認できる

**代替案**:
- 保存ボタン方式 → GUI位置モードのように次回反映の項目と混在するため、一貫性が損なわれる

### 6. ConfigModal のコンポーネント設計

**決定**: `createConfigModal()` 関数を作成し、既存モーダルと同じパターンに従う

```javascript
export function createConfigModal({ onClose, isDualViewEnabled, guiPositionMode, onDualViewChange, onGuiPositionModeChange }) {
  // overlay, content, closeBtn の構造は既存モーダルと同じ
  // トグルスイッチとラジオボタンを content 内に配置
}
```

**理由**:
- `HelpModal` と `MetadataModal` の既存パターンとの一貫性
- UIManager での統合が容易
- CSSクラス名が統一される

## Risks / Trade-offs

### リスク1: 固定位置が画面外になる可能性
- **リスク**: 非常に小さいウィンドウサイズで固定位置が画面外になる
- **対策**: 既存の `Draggable.clampToViewport()` がウィンドウリサイズ時に適用されるため、画面内にクランプされる

### リスク2: localStorage のキー管理
- **リスク**: 新しいキー（`GUI_POSITION_MODE`）の追加により、既存ユーザーのデフォルト値が不明確
- **対策**: `_loadGuiPositionMode()` メソッドで、キーが存在しない場合は `'remember'` をデフォルトとする

### トレードオフ1: 設定反映タイミングの一貫性
- **トレードオフ**: 見開き表示は即時反映、GUI位置モードは次回反映と、反映タイミングが異なる
- **判断**: GUI位置モードの性質上（次回表示時に初期位置を決定）、即時反映は不自然。説明文で明示することで対応

### トレードオフ2: 将来的な設定項目の追加
- **トレードオフ**: 現時点では2つの設定項目のみで、モーダルとしてはシンプル
- **判断**: 基盤を整備することで、将来的な追加が容易になる。現時点での過度な抽象化は避ける

## Migration Plan

1. **Store の拡張**
   - `STORAGE_KEYS.GUI_POSITION_MODE` を追加
   - `state.guiPositionMode` と `state.isConfigModalOpen` を追加
   - `setState` に条件付き保存ロジックを追加

2. **ConfigModal の実装**
   - `src/ui/components/ConfigModal.js` を作成
   - i18n に翻訳文字列を追加

3. **UIManager の統合**
   - ConfigModal の表示管理を追加
   - `init()` での初期位置決定ロジックを更新

4. **ショートカットの追加**
   - `shortcuts.js` に config ショートカットを追加
   - `main.js` に `,` キーハンドラを追加

5. **テストと検証**
   - 既存の見開き表示が正常に動作すること
   - GUI位置モードの切り替えが正常に動作すること
   - 既存モーダルとデザインが統一されていること

**ロールバック**:
- 新しいコンポーネントとショートカットを削除
- Store の変更を元に戻す（既存の動作には影響しない）

## Open Questions

なし（探索フェーズで明確化済み）
