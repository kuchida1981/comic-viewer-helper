## MODIFIED Requirements

### Requirement: ポップアンダー広告リダイレクトの抑制
`PopUnderBlocker` SHALL ページ内の `<a>` タグへのクリックイベントをキャプチャフェーズでインターセプトし、サイト側スクリプトによるポップアンダー広告リダイレクトを抑制する。インターセプト時には `stopImmediatePropagation()` と `preventDefault()` を呼び、`window.location.href` で現在のタブで直接遷移を実行する。この動作は、ビューアーのメイン UI が起動していないページ（作品詳細ページや検索結果ページなど）でも有効である。

#### Scenario: 通常リンクへのクリックで直接遷移を実行する
- **WHEN** ユーザーが `target` 属性なしの `<a>` タグをクリックする
- **THEN** イベントが他のハンドラに伝達されず、現在のタブで直接 `link.href` へ遷移する

#### Scenario: キャプチャフェーズで他のハンドラより先に実行される
- **WHEN** サイト側スクリプトがバブルフェーズに click ハンドラを登録している
- **THEN** `PopUnderBlocker` のハンドラがキャプチャフェーズで先に実行され、`stopImmediatePropagation()` で他のハンドラの実行を阻止する

#### Scenario: ビューアー未起動のページでも抑制が有効である
- **WHEN** ビューアーが起動していないページ（作品詳細ページ等）で `<a>` タグをクリックする
- **THEN** `PopUnderBlocker` がクリックをインターセプトし、サイト側のスクリプトによる新しいタブ展開を阻止して現在のタブで遷移する
