## Context

現在、このプロジェクトには「お気に入り」機能がありますが、閲覧履歴は `luckyHistory` としてURLのみを最大20件保持する限定的な機能にとどまっています。
ユーザーが過去に閲覧した作品を再発見しやすくし、読書統計（閲覧回数）を可視化するために、これらを統合した「ライブラリ」機能へと拡張します。

## Goals / Non-Goals

**Goals:**
- **詳細な履歴データ保持**: URLだけでなく、タイトル、サムネイル、閲覧統計（初回/最終閲覧日時、回数）を保存する。
- **インテリジェントな閲覧カウント**: 短時間の重複アクセスを排除し、意味のある「再訪」をカウントする。
- **統合UI**: `FavoritesModal` を拡張し、お気に入りと履歴をシームレスに切り替えて管理できるUIを提供する。
- **柔軟なソート**: 閲覧回数や日付による並び替え機能を実装する。
- **履歴からのアクション**: 履歴一覧から直接お気に入り登録や削除を行えるようにする。

**Non-Goals:**
- **ストレージエンジンの変更**: `localStorage` から `IndexedDB` への移行はこの変更の範囲外とする（将来の課題とする）。
- **外部サービス連携**: ブラウザ間の同期などは行わない。

## Decisions

### 1. データ構造の定義
`HistoryEntry` インターフェースを `RelatedWork` を継承して定義します。
```typescript
interface HistoryEntry extends RelatedWork {
  viewCount: number;
  lastViewedAt: number;
  firstViewedAt: number;
}
```
`StoreState` の `luckyHistory` は `HistoryEntry[]` に変更します。

### 2. 閲覧カウントと重複排除のロジック
作品ページ（`App.init`）で履歴保存を呼び出す際、以下のロジックを適用します：
- 既存の履歴がある場合：
    - `lastViewedAt` から24時間以上経過していれば `viewCount` をインクリメントし、`lastViewedAt` を更新する。
    - 24時間未満であれば `lastViewedAt` の更新のみ行う。
- 新規の履歴の場合：
    - `viewCount: 1` として新規作成する。

### 3. モーダルUIの拡張
`FavoritesModal.ts` を以下の通り拡張します：
- **タブ切り替え**: `activeTab` 状態（'favorites' | 'history'）を持ち、コンテンツを切り替える。
- **ソート機能**: `sortMode` 状態を持ち、表示順を制御する。
    - 履歴用: `lastViewedAt` (最新順), `viewCount` (閲覧数順), `firstViewedAt` (古い順)
    - お気に入り用: デフォルト（追加順）
- **グリッドアイテム**: `RelatedWork` 表示コンポーネントを共通化し、各アイテムにお気に入りトグルボタン（ハートアイコン）と削除ボタンを追加する。

### 4. 既存データの移行
`Store` の初期化時に、既存の `string[]` 形式の `luckyHistory` を検知した場合、空の `HistoryEntry[]` または最低限の情報を持つオブジェクトに変換するマイグレーション処理を実装します。

## Risks / Trade-offs

- **[Risk] localStorage の容量制限**
    - [Mitigation] 履歴の保存件数に厳密な制限を設けない方針だが、`localStorage`（約5MB）を使い切るリスクがある。将来的な `GM_setValue` への移行を推奨する。
- **[Trade-off] 24時間ルールの固定**
    - [Decision] シンプルさのため24時間を固定値とするが、ユーザー設定で変更可能にするほどではないと判断。
- **[Performance] 大量データのレンダリング**
    - [Mitigation] 数百件程度の履歴であればDOMの再生成で十分間に合うと予想するが、パフォーマンス低下が見られる場合は `updateFavorites` メソッド内の差分更新を強化する。
