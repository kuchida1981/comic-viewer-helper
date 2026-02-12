## Context

現在のプロジェクトは、レイヤードアーキテクチャの原則に則って開発されていますが、依存関係のチェックは手動（コードレビュー）に依存しています。`src/logic.ts` などの純粋なロジック層が、誤って上位レイヤー（UIやManagers）に依存してしまうリスクを排除するため、静的解析による自動強制を導入します。

## Goals / Non-Goals

**Goals:**
- `eslint-plugin-boundaries` を使用して、定義されたレイヤー間の依存関係を強制する。
- 依存関係の違反をビルドやCIの段階で検出可能にする。
- 型定義や共通ユーティリティを `Shared` 層として定義し、全レイヤーからの安全な利用を許可する。

**Non-Goals:**
- 大規模なコードのリファクタリング（現状、違反がないことが確認されているため）。
- レイヤードアーキテクチャ以外の設計ルールの導入。

## Decisions

### 1. レイヤー定義と依存ルール
以下の通り、要素（Elements）を定義し、依存関係を制限します。

| 要素名 | パス / ファイルパターン | 依存可能な層 |
| :--- | :--- | :--- |
| **shared** | `src/{types,type-guards,ui/utils,ui/styles}.ts` | shared |
| **logic** | `src/logic.ts` | shared |
| **store** | `src/store.ts` | logic, shared |
| **adapters** | `src/adapters/**` | logic, store, shared |
| **ui** | `src/ui/**` (shared以外) | shared |
| **managers** | `src/managers/**` | ui, adapters, store, logic, shared |
| **entry** | `src/{main,header}.ts` | (全て) |

**Rationale:** 現状のコードベースの構造に最も即しており、かつ「ビジネスロジック（Logic）の純粋性」と「UI部品の自律性」を担保できる構成です。

### 2. eslint-plugin-boundaries の設定方法
`eslint.config.mjs` (Flat Config) に直接設定を記述します。
`boundaries/elements` でパスを定義し、`boundaries/dependency-nodes` (または相当するルール) で依存関係を記述します。

### 3. テストファイルの扱い
`**/*.test.ts` に対しては、依存関係ルールを無効化、または緩和します。テスト時にはモック作成のために例外的なインポートが必要になるためです。

## Risks / Trade-offs

- **[Risk] 設定の複雑化** → **Mitigation**: レイヤー定義をシンプルに保ち、`shared` 層を適切に設けることで、過度な制限による開発効率の低下を防ぎます。
- **[Risk] ディレクトリ移動時の手間** → **Mitigation**: ファイルの場所が変わった際に ESLint がエラーを出すのは、設計を見直す良い機会であると捉えます。
