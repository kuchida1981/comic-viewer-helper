## Context

お気に入りモーダルのタグクラウドビュー（`src/ui/components/FavoritesModal.ts`）では、タグの種類（`artist`, `genre`, `null`＝その他 など）によるフィルタ状態を `excludedTypes: Set<string | null>` として保持している。初期状態は空の `Set`（すべての種類が選択状態）であり、現在は種類チップをクリックするたびに `excludedTypes` への追加・削除を単純にトグルしている。

本変更では、全選択状態からの初回クリックで「選んだ種類のみを選択状態にする」排他的選択へ切り替え、その後の操作で追加選択や個別除外（ただし最後の1種類は除外不可）、およびリセットボタンによる全選択への復帰を実現する。

## Goals / Non-Goals

**Goals:**
- 全選択状態からワンクリックで特定の種類のみに絞り込めるようにする。
- 絞り込み後に他の除外された種類をクリックすることで、選択対象を追加できるようにする。
- 絞り込み中に選択済みの種類をクリックして除外できるようにしつつ、最後の1種類は除外できないようにして意図しない空表示を防ぐ。
- 全選択に戻す「リセット（Reset）」ボタンを種類チップの行に設け、全選択状態のときは非活性（`disabled`）にする。
- 状態遷移ロジックを `src/logic.ts` に純粋関数として切り出し、100% のテストカバレッジを維持する。

**Non-Goals:**
- 一覧ビュー（トレンドセクションおよび作品グリッド）のフィルタリング変更。
- フィルタ状態の永続化（モーダルを閉じたら全選択に戻る仕様は維持）。
- 上位200件の制限ロジックや中央配置レイアウトの変更。

## Decisions

### 1. 状態表現として既存の `excludedTypes: Set<string | null>` を維持する
- **選択**: 引き続き「除外された種類の集合（`excludedTypes`）」で状態を管理する。
- **代替案**: 「選択された種類の集合（`selectedTypes: Set<string | null> | null`）」に変更する。
- **理由**: `calculateTrends` や `rerenderCloudView` のシグネチャを変更せずに済み、お気に入り更新時に新しいタグ種別が増えても自動的に表示対象（非除外）として扱えるため。

### 2. トグル時の状態遷移を `src/logic.ts` の純粋関数に分離する
- **選択**: `toggleTagTypeFilter(excludedTypes, allTypes, clickedType)` を `src/logic.ts` に追加する。
- **遷移ルール**:
  1. `excludedTypes.size === 0`（全選択状態）のとき: `allTypes` のうち `clickedType` 以外のすべてを `excludedTypes` に含めた新しい `Set` を返す。
  2. `excludedTypes.has(clickedType)`（除外中の種類をクリック）のとき: `clickedType` を取り除いた新しい `Set` を返す（結果として他と合わせて選択状態になる）。
  3. `!excludedTypes.has(clickedType)`（選択中の種類をクリック）のとき: `allTypes` のうち除外されていない種類が 2 つ以上ある場合のみ `clickedType` を追加した新しい `Set` を返す。最後の 1 種類の場合は変更せずそのままのコピーを返す。
- **理由**: UI コンポーネント（DOM）からロジックを分離するプロジェクト規約に従い、境界条件の単体テストを網羅しやすくするため。

### 3. リセットボタンの配置とラベル
- **選択**: `createTagTypeChips` が生成する `.comic-helper-tag-type-filter` コンテナの末尾に、リセットボタン（`button.comic-helper-tag-type-reset`）を配置する。`excludedTypes.size === 0` のときは `disabled = true` とする。
- **ラベル**: `src/i18n.ts` に `ui.tagTypeReset` を追加し、既存の他ボタン（`Show All`, `List`, `Close` など）の表記トーンに合わせて `en: 'Reset'`, `ja: 'リセット'` とする。

## Risks / Trade-offs

- [既存の減算方式（1つだけ外す操作）に慣れたユーザーが戸惑う可能性] → 特定の種類だけを見たいユースケースが主であり、1つだけ外したい場合も「見たい種類を順に選択する」または「全選択から1つ選び、残りを追加する」ことで代替可能。
- [全選択状態でリセットボタンが常に表示されることによる視認性] → `disabled` 状態では透明度を下げ（例: `opacity: 0.4; cursor: default;`）、選択中の状態と明確に区別する。
