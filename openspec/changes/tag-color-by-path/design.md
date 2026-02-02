## Context

現在のメタデータモーダルでは、すべてのタグが同一のスタイル（グレー背景）で表示されている。タグの `href` にはパス情報（例: `/artist/xxx`）が含まれており、これを利用して種別を判定できる。

探索フェーズで検討した結果、以下の設計方針を採用する：
- タグデータに `type` プロパティを追加し、アダプターが種別を判定して返す
- UI層は `type` に基づいてCSSクラスを付与するのみ
- 色の定義はCSS（styles.js）で管理

## Goals / Non-Goals

**Goals:**
- タグの種別（artist, character, circle, fanzine, genre, magazine, parody）を視覚的に区別できるようにする
- サイト固有のパス構造への依存をアダプター層に閉じ込める
- 既存のタグ表示機能との後方互換性を維持する

**Non-Goals:**
- ユーザーによる色のカスタマイズ機能（将来の拡張として検討可能）
- 対応サイト以外のパス構造への対応
- アクセシビリティ要件への完全準拠（色以外の識別手段の追加は今回スコープ外）

## Decisions

### Decision 1: タグデータに `type` プロパティを追加

**選択**: `getMetadata()` が返すタグオブジェクトに `type: string | null` を追加

**代替案**:
- アダプターに `getTagType(href)` メソッドを追加し、UI側で呼び出す → UI層からアダプターへの参照が必要になり複雑化
- 色情報をアダプターが返す → UI関心事がアダプター層に漏れる

**理由**: データ層で完結し、関心の分離が明確。UIは `type` を見てクラスを付与するだけでよい。

### Decision 2: パスからタグ種別を判定するロジック

**選択**: `URL.pathname.startsWith()` で判定

```
/artist/    → 'artist'
/character/ → 'character'
/circle/    → 'circle'
/fanzine/   → 'fanzine'
/genre/     → 'genre'
/magazine/  → 'magazine'
/parody/    → 'parody'
その他      → null
```

**理由**: シンプルで十分。将来サイトが増えた場合は、各アダプターで独自の判定ロジックを実装可能。

### Decision 3: CSSクラス命名規則

**選択**: BEM修飾子パターン `comic-helper-tag-chip--{type}`

**理由**: 既存のスタイル命名規則に準拠。タグ種別が `null` の場合はベースクラスのみ適用し、デフォルトのグレー表示を維持。

### Decision 4: 色の定義

**選択**: 仮の色で実装し、実際の見た目を確認してから調整

| type | 背景色（仮） | 意図 |
|------|-------------|------|
| artist | #5c3d4a | 赤・ピンク系 |
| character | #3d5c4a | 緑系 |
| circle | #3d4a5c | 青・シアン系 |
| fanzine | #5c4a3d | オレンジ・黄色系 |
| genre | #4a4a4a | グレー系 |
| magazine | #4a3d5c | 紫系 |
| parody | #4a5c5c | ティール系 |

**理由**: ダークテーマ（#1a1a1a背景）に馴染む落ち着いた彩度の色を選定。ホバー時は明度を上げる。

## Risks / Trade-offs

- **[Risk] 未知のパスが来た場合** → `type: null` でデフォルトスタイルを適用。機能的には問題なし。
- **[Risk] 色のコントラスト不足** → 実装後に視認性を確認し、必要に応じて調整。
- **[Trade-off] 型定義の変更** → `Metadata` 型を更新する必要があるが、`type` は optional または nullable なので既存コードへの影響は軽微。
