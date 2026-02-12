# layered-architecture-enforcement

## Purpose
プロジェクトの各レイヤー（Logic, Store, Adapters, UI, Managers, Entry）間の依存関係を強制し、アーキテクチャの腐敗を防ぐ。

## Requirements

### Requirement: レイヤー定義の強制
システムは、プロジェクトの各ファイルを特定の「レイヤー」に分類し、レイヤー間の依存関係を強制しなければならない（SHALL）。

#### Scenario: 不適切なインポートの検出
- **WHEN** `src/logic.ts` が `src/managers/Navigator.ts` をインポートしようとした場合
- **THEN** ESLint が依存関係違反としてエラーを報告する

#### Scenario: 適切なインポートの許容
- **WHEN** `src/managers/UIManager.ts` が `src/logic.ts` をインポートした場合
- **THEN** ESLint はエラーを報告せず、パスする

### Requirement: Shared層の例外規定
システムは、`Shared` と定義されたファイル（`types.ts`, `type-guards.ts`, `ui/utils.ts`, `ui/styles.ts`）へのインポートを全てのレイヤーから許可しなければならない（SHALL）。

#### Scenario: Logic層からShared層へのアクセス
- **WHEN** `src/logic.ts` が `src/types.ts` をインポートした場合
- **THEN** ESLint はエラーを報告せず、パスする

#### Scenario: UI層からShared層へのアクセス
- **WHEN** `src/ui/components/PowerButton.ts` が `src/ui/styles.ts` をインポートした場合
- **THEN** ESLint はエラーを報告せず、パスする

### Requirement: テストコードの例外規定
システムは、テストコード（`*.test.ts`）において、テスト対象の依存関係を解決するためのインポート（モックなど）を許可しなければならない（SHALL）。

#### Scenario: テストコードでのモックインポート
- **WHEN** `src/logic.test.ts` が `src/test/mocks/dom.js` をインポートした場合
- **THEN** ESLint はエラーを報告せず、パスする
