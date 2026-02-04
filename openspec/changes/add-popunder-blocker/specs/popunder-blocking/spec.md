## ADDED Requirements

### Requirement: ポップアンダー広告リダイレクトの抑制
`PopUnderBlocker` は、ページ内の `<a>` タグへのクリックイベントをキャプチャフェーズでインターセプトし、サイト側スクリプトによるポップアンダー広告リダイレクトを抑制する。インターセプト時には `stopImmediatePropagation()` と `preventDefault()` を呼び、`window.location.href` で現在のタブで直接遷移を実行する。

#### Scenario: 通常リンクへのクリックで直接遷移を実行する
- **WHEN** ユーザーが `target` 属性なしの `<a>` タグをクリックする
- **THEN** イベントが他のハンドラに伝達されず、現在のタブで直接 `link.href` へ遷移する

#### Scenario: キャプチャフェーズで他のハンドラより先に実行される
- **WHEN** サイト側スクリプトがバブルフェーズに click ハンドラを登録している
- **THEN** `PopUnderBlocker` のハンドラがキャプチャフェーズで先に実行され、`stopImmediatePropagation()` で他のハンドラの実行を阻止する

### Requirement: 除外対象リンクの非インターセプト
以下の条件に該当する `<a>` クリックは、インターセプト対象としない。

#### Scenario: target="_blank" リンクは除外する
- **WHEN** ユーザーが `target="_blank"` が明示されている `<a>` タグをクリックする
- **THEN** インターセプトを行わず、デフォルトの動作のまま遷移する

#### Scenario: Ctrl キー+クリックは除外する
- **WHEN** ユーザーが `Ctrl` キーを押しながら `<a>` タグをクリックする
- **THEN** インターセプトを行わず、デフォルトの動作のまま遷移する

#### Scenario: Meta キー+クリックは除外する
- **WHEN** ユーザーが `Meta` キーを押しながら `<a>` タグをクリックする
- **THEN** インターセプトを行わず、デフォルトの動作のまま遷移する

#### Scenario: javascript: リンクは除外する
- **WHEN** ユーザーが `href` が `javascript:` で始まる `<a>` タグをクリックする
- **THEN** インターセプトを行わず、デフォルトの動作のまま遷移する

### Requirement: 機能オン/オフの制御
`PopUnderBlocker` は、`store` の `enabled` フラグで機能のオン/オフを制御する。

#### Scenario: 機能が無効の場合はインターセプトしない
- **WHEN** `store` の `enabled` が `false` の状態で `<a>` タグがクリックされる
- **THEN** インターセプトを行わず、デフォルトの動作のまま遷移する

#### Scenario: 機能が有効の場合はインターセプトする
- **WHEN** `store` の `enabled` が `true` の状態で除外対象外の `<a>` タグがクリックされる
- **THEN** イベントをインターセプトし、現在のタブで直接遷移を実行する
