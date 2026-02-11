## ADDED Requirements

### Requirement: Docker-based Testing Environment
E2Eテスト環境は Docker を使用して完全に分離されている必要があります（SHALL）。

#### Scenario: Running tests in Docker
- **WHEN** `docker-compose -f docker-compose.e2e.yml up` を実行する
- **THEN** モックサーバーと Playwright コンテナが起動し、テストが完了して終了コードを返す

### Requirement: Mock Server with Nginx
テスト環境は nginx を使用して、本物のサイトを模した HTML 構造を配信する必要があります（SHALL）。

#### Scenario: Fetching mock content
- **WHEN** Playwright からモックサーバーの URL にアクセスする
- **THEN** アダプターが認識可能な HTML 要素を含むページが正しく表示される

### Requirement: UserScript Injection
Playwright はビルドされた `comic-viewer-helper.user.js` をページに注入して実行する必要があります（SHALL）。

#### Scenario: Loading UserScript
- **WHEN** ページがロードされた後、`dist/` 内のスクリプトを注入する
- **THEN** ページ内に `#comic-helper-ui` が生成される
