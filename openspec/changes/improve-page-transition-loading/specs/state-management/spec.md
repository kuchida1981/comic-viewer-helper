## ADDED Requirements

### Requirement: 一時的なUI状態の管理
Store は永続化の必要がない一時的なUI状態（ローディング中など）も管理できるものとし、これらは `localStorage` への保存対象から除外されなければならない（SHALL）。

#### Scenario: ローディング状態の更新
- **WHEN** 画像読み込み待ちが発生し、`Store.setState({ isLoading: true })` が呼び出されたとき
- **THEN** 購読しているコンポーネントには通知されるが、`localStorage` には保存されない
- **AND** ページリロード後、この状態は初期値（false）に戻る
