# type-safety-enforcement Specification

## Purpose
TBD - created by archiving change refactor-strict-types. Update Purpose after archive.
## Requirements
### Requirement: Store の動的キーアクセスが型安全であること
`Store.setState` は `Partial<StoreState>` のキーと値の対応を静的に検証できるように実装されなければならない（SHALL）。コードベース内に `@ts-expect-error` や `any` キャストを用じてこの検証を迂回する箇所はないものとする。

#### Scenario: コンパイル時に型不一致が検出される
- **WHEN** `setState` の動的キーアクセス実装を変更した際に、キーと値の型が不一致になる
- **THEN** TypeScript コンパイルでエラーが発生し、`@ts-expect-error` なしでビルドが成功しないようにする

#### Scenario: 正常な状態更新は型エラーなしで動作する
- **WHEN** `setState({ enabled: true })` のように正しい型の値が渡される
- **THEN** コンパイルエラーなしでビルドが成功し、状態が正しく更新される

### Requirement: 翻訳キーアクセスが any を使用しないこと
`t` 関数の内部実装で動的キーアクセスを行う際に、`any` 型は使用しなければならない（SHALL NOT）。アクセス箇所では `unknown` 型へのナローイングを用いて型安全性を維持する。

#### Scenario: any キャストと eslint-disable コメントが残存しない
- **WHEN** `src/i18n.ts` のコードを静的解析する
- **THEN** `any` キャストおよび `@typescript-eslint/no-explicit-any` の抑制コメントが存在しない

#### Scenario: フォールバック動作は変更されない
- **WHEN** 翻訳キーが現在語で未定義の場合
- **THEN** 英語辞書へのフォールバック、あるいはキー名の返却が以前と同一の動作を維持する

### Requirement: UIコンポーネントのインターフェース定義が単一箇所に所在する
各コンポーネントのインターフェース（`PowerButtonComponent` など）は実装ファイルで一つだけ定義され、利用側からインポートされなければならない（SHALL）。同一インターフェースの重複定義はないものとする。

#### Scenario: インターフェースが実装側で唯一定義されている
- **WHEN** コンポーネントインターフェース名（例: `PowerButtonComponent`）を検索する
- **THEN** 定義は実装ファイル（例: `PowerButton.ts`）にのみ存在し、UIManager.ts では削除されている

#### Scenario: インポート変更後もコンポーネントの型チェックが正常に動作する
- **WHEN** UIManager がインポートされたインターフェースを使用してコンポーネントを参照する
- **THEN** コンパイルエラーなしでビルドが成功し、コンポーネントの戻り値が正しく型付けられている

