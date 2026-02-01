## Context

現在のコミックビューアには、見開きのペアリングを1ページ分ずらす（オフセットする）機能がありますが、ボタンラベルが `Adjust` となっており、具体性に欠けます。また、この操作にはキーボードショートカットが割り当てられておらず、頻繁な調整が必要な場合にマウス操作を強いる課題があります。

## Goals / Non-Goals

**Goals:**
- ボタンラベルを `Adjust` から `Offset` に変更し、意味を明確にする。
- ツールチップを詳細化し、操作の結果を予測しやすくする。
- `o` キーによる見開きオフセットのトグル機能を追加する。
- これらの変更を、スクリプトおよび見開きモードが有効な場合のみに制限する。

**Non-Goals:**
- 見開きモード以外の表示ロジックの変更。
- 設定の永続化ロジック（`spreadOffset` の保存など）の変更。

## Decisions

### 1. ボタンラベルとツールチップの更新
- **Decision**: `src/ui/components/SpreadControls.js` 内の `Adjust` ボタンの定義を更新する。
- **Rationale**: ユーザー調査（思考実験）の結果、`Offset` の方が挙動（ズレの補正）を正確に表しており、ショートカットキー `o` との連想も容易であるため。

### 2. キーボードショートカット 'o' の追加
- **Decision**: `src/main.js` の `onKeyDown` ハンドラに `o` キーの処理を追加する。
- **Rationale**: 既存の `d` キー（Dual view toggle）と同様のパターンで実装することで、一貫性を保つ。
- **Implementation**:
  ```javascript
  } else if (e.key === 'o' && isDualViewEnabled) {
    e.preventDefault();
    const { spreadOffset } = this.store.getState();
    this.store.setState({ spreadOffset: spreadOffset === 0 ? 1 : 0 });
  }
  ```

### 3. Shortcut Activation Condition
- **Decision**: `o` キーのショートカットは `isDualViewEnabled: true` かつ `enabled: true` の時のみ有効とする。
- **Rationale**: 単一ページ表示モードではオフセットの概念が存在しないため、誤操作を防ぐ。

## Risks / Trade-offs

- [Risk] 他の拡張機能やサイト自体のショートカットと衝突する可能性。
  - → Mitigation: `o` キーは比較的衝突が少ないが、入力フィールドフォーカス時には無効化する既存のガード条件（`this.isInputField(e.target)`）を適用する。
