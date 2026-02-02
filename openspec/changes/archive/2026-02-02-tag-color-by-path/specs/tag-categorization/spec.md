## ADDED Requirements

### Requirement: タグ種別の判定

システムは、タグのリンク先URLパスに基づいてタグの種別を判定しなければならない（SHALL）。

対応する種別:
- `artist`: `/artist/` で始まるパス
- `character`: `/character/` で始まるパス
- `circle`: `/circle/` で始まるパス
- `fanzine`: `/fanzine/` で始まるパス
- `genre`: `/genre/` で始まるパス
- `magazine`: `/magazine/` で始まるパス
- `parody`: `/parody/` で始まるパス

上記に該当しないパスの場合、種別は `null` とする。

#### Scenario: アーティストタグの判定
- **WHEN** タグの href が `/artist/someone` である
- **THEN** タグの type は `'artist'` となる

#### Scenario: キャラクタータグの判定
- **WHEN** タグの href が `/character/someone` である
- **THEN** タグの type は `'character'` となる

#### Scenario: 未知のパスの判定
- **WHEN** タグの href が `/unknown/something` である
- **THEN** タグの type は `null` となる

### Requirement: タグ種別に応じた色分け表示

システムは、メタデータモーダルにおいてタグを種別に応じた色で表示しなければならない（SHALL）。

- 各種別には固有の背景色が割り当てられる
- 種別が `null` のタグはデフォルトのグレー背景で表示される
- ホバー時は背景色の明度が上がる

#### Scenario: アーティストタグの色表示
- **WHEN** type が `'artist'` のタグがモーダルに表示される
- **THEN** タグは赤・ピンク系の背景色で表示される

#### Scenario: 未分類タグの色表示
- **WHEN** type が `null` のタグがモーダルに表示される
- **THEN** タグはデフォルトのグレー背景（#333）で表示される
