## Context
現在の `Navigator.ts` は、オートプレイのタイマーを `isAutoplayEnabled` と `autoplayInterval` の変化のみで制御しています。モーダルの表示状態（`isSearchModalOpen` 等）を考慮していないため、ユーザーがモーダル操作中も背景でページが進んでしまいます。

## Goals / Non-Goals

**Goals:**
- モーダル表示中にオートプレイを安全に停止（サスペンド）させる。
- モーダルが閉じられた際、ユーザーの手を介さずオートプレイを再開させる。
- オートプレイの状態管理ロジックを `Navigator.ts` に集約する。

**Non-Goals:**
- オートプレイの待機時間をモーダル表示中もカウントし続けること（タイマーはリセットします）。
- UIコンポーネント（`AutoplayControls`）側で表示状態を制御すること。

## Decisions

- **Decision:** `Navigator.ts` 内で `isAnyModalOpen` 状態を算出し、タイマーの開始条件に加える。
- **Rationale:** 複数のモーダル状態を個別に監視するより、一括して「いずれかが開いているか」を判断する方がロジックが単純化されるため。
- **Alternative:** `Store` に `isAnyModalOpen` という算出プロパティを持たせる案もあったが、現在の `Store` はプレーンな状態保持に徹しているため、各マネージャー側で判断する既存のパターンに従う。

- **Decision:** `Navigator.ts` の `subscribe` 内でモーダル状態の変更（開閉）を検知し、`_startAutoplay()` または `_stopAutoplay()` を呼び出す。
- **Rationale:** 既存의 `subscribe` ライフサイクルに乗せることで、実装が最小限で済み、他の状態変更との競合を防げる。

- **Decision:** `Navigator.ts` において、`scrollToImage` が最終ページに到達した際の `isMetadataModalOpen` を `true` にする処理を維持しつつ、オートプレイを `false` に変更する処理は削除する。
- **Rationale:** 新しい「一時停止」ロジックにより、Infoモーダルが開けば自然にタイマーが止まり、閉じれば（ランダムジャンプ等がなければ）再開または適切に終了するため、強制的な OFF は不要になる。

## Risks / Trade-offs

- **[Risk]** モーダルを閉じた瞬間にタイマーが再開されるため、非常に短い間隔（1秒など）に設定していると、閉じ直後にページがめくれて驚かせる可能性がある。
- **[Mitigation]** オートプレイの仕様上、再開時は常に設定秒数（フルカウント）を待機するため、即座にめくれることはない。
