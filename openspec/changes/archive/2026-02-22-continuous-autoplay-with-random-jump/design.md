## Context

現在のオートプレイ機能（`Navigator.ts`）は、最終ページに到達するとタイマーを停止し、ストアの `isAutoplayEnabled` を `false` に変更して終了します。また、ページ遷移（リロード）を伴うジャンプ後の自動再開ロジックが不足しています。
ランダムジャンプ機能（`logic.ts` の `jumpToRandomWork`）は既に存在しますが、遷移の成否を呼び出し元が知る手段がありません。

## Goals / Non-Goals

**Goals:**
- 最終ページ到達時に、現在の作品を閉じて次の作品へランダム遷移する。
- 遷移先でもオートプレイ状態（`isAutoplayEnabled: true`）を維持し、自動的に再生を開始する。
- ランダムジャンプの候補がない場合に限り、安全にオートプレイを停止する。

**Non-Goals:**
- ランダムジャンプ以外の遷移（「次の作品」への順次遷移など）の実装。
- オートプレイ専用の新しい設定 UI の追加（既存の UI で対応可能か検討）。

## Decisions

- **Decision: `Navigator.init` でのオートプレイ自動開始**
  - **Rationale:** ページを跨いでオートプレイを継続するには、初期化時にストアの状態を確認し、有効であればタイマーを開始する必要があるため。
  - **Alternative:** 常に手動開始とする案。→ 連続閲覧の体験を損なうため不採用。

- **Decision: `jumpToRandomWork` の戻り値追加**
  - **Rationale:** 遷移候補が存在したかどうかを `Navigator` 側で判断し、候補がない場合にのみ `isAutoplayEnabled` を `false` にするため。
  - **Implementation:** `jumpToRandomWork` が `boolean`（遷移を試みたか否か）を返すように変更する。

- **Decision: 最終ページでの停止処理の置換**
  - **Rationale:** `_startAutoplay` 内の終了判定において、`isAutoplayEnabled: false` にする代わりに `jumpToRandomWork` を呼び出す。

## Risks / Trade-offs

- **[Risk] 無限ループや意図しない遷移の発生**
  - **Mitigation:** ランダムジャンプはユーザーが明示的にオートプレイをオンにしている間のみ実行される。また、ジャンプ候補がない場合は確実に停止する。
- **[Risk] ページロード直後のジャンプ**
  - **Mitigation:** オートプレイのインターバル（デフォルト5秒など）を待ってから最初のスクロールが行われるため、即座に遷移することはない。
