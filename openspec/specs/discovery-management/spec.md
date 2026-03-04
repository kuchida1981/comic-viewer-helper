# discovery-management Specification

## Purpose
TBD - created by archiving change lucky-nav-replenishment. Update Purpose after archive.
## Requirements
### Requirement: 候補プールの能動的補充 (Replenishment)
システムは、ランダムジャンプの候補作品数が不足している場合、能動的に外部から作品を補充しなければならない (SHALL)。
補充の手段として、以下の優先順位で実行する：
1. **Deep Fetch**: 検索キャッシュ（`searchCache`）に「次のページ（`nextPageUrl`）」が存在する場合、そのページを fetch して候補に加える。
2. **タグベースの補充**: 現在表示されている作品のタグ（`metadata.tags`）からランダムに1つを選択し、そのタグの検索結果ページを fetch して候補に加える。

#### Scenario: 候補不足時の Deep Fetch
- **WHEN** ランダムジャンプが実行される
- **AND** 現在の候補作品数が閾値（例：5件）未満である
- **AND** 検索キャッシュに `nextPageUrl` が存在する
- **THEN** システムは `nextPageUrl` をバックグラウンドで取得し、得られた作品を候補に追加してから抽選を行う

#### Scenario: 候補不足時のタグベース補充
- **WHEN** ランダムジャンプが実行される
- **AND** 現在の候補作品数が閾値（例：5件）未満である
- **AND** Deep Fetch が実行できない（`nextPageUrl` がない等）
- **AND** 作品にタグが設定されている
- **THEN** システムはタグを1つ選択して検索を実行し、得られた作品を候補に追加してから抽選を行う

### Requirement: 非同期抽選中の状態管理
システムは、作品の補充（fetch）を行っている間、その状態を管理し、多重発火を防止しなければならない (SHALL)。

#### Scenario: 補充中のジャンプ要求無視
- **WHEN** 補充プロセスが実行中である
- **THEN** 新たなランダムジャンプ要求は無視されるか、現在のプロセスの完了を待機する

