## Purpose
ユーザーが訪れた作品のURL履歴（lucky-history）をサイトごとに保持し、ランダム遷移（Lucky Navigation）などの機能で、最近閲覧した作品を除外するために使用する。

## Requirements

### Requirement: サイト別の閲覧履歴の保持
システムは、表示された作品のURLを正規化して保存し、localStorage を用いてサイト（ホスト）ごとに最大20件まで永続化しなければならない (SHALL)。
**履歴配列（luckyHistory）に含まれる全ての要素は、常に正規化された形式（origin + pathname）で保持されなければならない。**

#### Scenario: ページ読み込み時の履歴追加
- **WHEN** 作品ページが読み込まれたとき
- **THEN** システムは現在のURLを正規化（クエリ・ハッシュを除去した origin + pathname）し、履歴の先頭に追加する
- **AND** 履歴内の全ての既存URLが正規化されていることを保証する
- **AND** 履歴が20件を超える場合は古いものから削除する

#### Scenario: 重複したURLの履歴追加
- **WHEN** 履歴に既に存在する作品ページ（正規化後の比較で判定）を再度読み込んだとき
- **THEN** システムは既存の履歴からそのURL（およびその正規化形式に一致するもの）を全て削除し、再度正規化されたURLを先頭に追加する（最新順を維持）

### Requirement: URLの正規化
システムは、URLの比較や保存を行う際、クエリパラメータおよびハッシュを除去した正規化されたURL（origin + pathname）を使用しなければならない (SHALL)。

#### Scenario: クエリパラメータを含むURLの正規化
- **WHEN** URL `https://example.com/work/123?page=5&source=nav#top` を正規化するとき
- **THEN** 正規化されたURLは `https://example.com/work/123` となる
