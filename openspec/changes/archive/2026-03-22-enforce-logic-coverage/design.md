## Context

`src/logic.ts` は本プロジェクトのコアロジックを担っており、高い信頼性が求められます。
現状のカバレッジ 97.33% では、稀にしか発生しない異常系や DOM の不整合状態に対する処理がテストされていません。

## Goals / Non-Goals

**Goals:**
- `src/logic.ts` のカバレッジを 100% に引き上げる。
- `src/logic.ts` に対する 100% カバレッジを Vitest の `thresholds` 設定で強制する。
- ガード節やエラーハンドリングの妥当性をテストで検証する。

**Non-Goals:**
- `src/logic.ts` 以外のファイルのカバレッジを 100% にすること。
- ロジックの大幅なリファクタリング。

## Decisions

### 1. Vitest の個別閾値設定
`vitest.config.mjs` の `coverage.thresholds` において、`src/logic.ts` 専用のエントリを追加します。
- **理由**: 全体平均 95% では個別の重要ファイルの欠落を見逃す可能性があるため。特定のファイルに対して 100% を指定することで、プロジェクトの「憲法」である `GEMINI.md` の要件を自動検証可能にします。

### 2. テストの追加場所
`src/logic.safety.test.ts` に、異常系や境界値（null チェック、不完全な DOM 要素など）のテストを集約します。
- **理由**: `src/logic.test.ts` は既に 80 個以上のテストがあり、正常系が中心です。異常系や安全性に関するテストを分離することで、メンテナンス性を高めます。

### 3. 未カバー箇所の攻略法
- **`fitImagesToViewport` の `!img` チェック**: `allImages` 配列に null を含む、あるいは `naturalWidth` が欠落した要素を意図的に混ぜて呼び出します。
- **`waitForImageLoad` の `!img` チェック**: `null` を引数として渡し、即座に resolve されることを確認します。
- **`forceImageLoad` / `triggerImageDecode`**: `getAttribute` や `decode` メソッドが存在しない（古い/特殊な）環境を模倣したモック要素でテストします。

## Risks / Trade-offs

- **[Risk]** 100% 強制により、軽微なリファクタリングでもテストが失敗するようになる。
- **[Mitigation]** `src/logic.ts` は純粋関数に近く、変更頻度が低いため、このコストよりも品質維持のメリットが上回ると判断します。
