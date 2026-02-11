## 1. 基盤構築 (Infrastructure)

- [x] 1.1 `package.json` に Playwright 関連の依存関係を追加する
- [x] 1.2 `Dockerfile.e2e` を作成し、ビルドとテスト実行のフローを定義する
- [x] 1.3 `docker-compose.e2e.yml` を作成し、Nginx と Playwright の連携を定義する
- [x] 1.4 `playwright.config.ts` を作成し、ベースURLやトレース出力設定を行う
- [x] 1.5 `scripts/build.mjs` を修正し、`.git` がない環境でもビルドが通るようにする

## 2. モックデータの準備 (Mocks)

- [x] 2.1 `tests/e2e/mocks` ディレクトリを作成する
- [x] 2.2 Nginx 配信用に、アダプターが認識可能なディレクトリ構造（`/magazine/123/`等）を作成する
- [x] 2.3 `DefaultAdapter` を検証するためのモック HTML を作成する
- [x] 2.4 テスト用のダミー画像アセットを配置する

## 3. テストシナリオの実装 (Test Implementation)

- [x] 3.1 共通のテストフィクスチャ（UserScript の自動注入ロジック等）を実装する
- [x] 3.2 ナビゲーション（キーボード、クリック）のテストを実装する
- [x] 3.3 UIインタラクション（フルスクリーン、モーダル）のテストを実装する
- [x] 3.4 レジューム機能のテストを実装する

## 4. CI/CD 連携 (CI Integration)

- [x] 4.1 GitHub Actions のワークフローファイルを追加する
- [x] 4.2 Docker Compose を使用して E2E テストを実行するステップを定義する
- [x] 4.3 テスト失敗時に Playwright レポートを Artifact として保存するように設定する
