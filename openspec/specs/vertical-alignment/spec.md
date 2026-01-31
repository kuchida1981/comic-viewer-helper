# vertical-alignment Specification

## Purpose
TBD - created by archiving change center-vertical-alignment. Update Purpose after archive.
## Requirements
### Requirement: 画像の垂直方向アライメント
画像はビューポートの垂直方向の中央に配置されなければならない（MUST）。

#### Scenario: 単一画像表示時
- **WHEN** ユーザーが単一画像モードで画像を閲覧している
- **THEN** 画像の上端と下端からビューポートの端までの距離が等しくなるように配置される

#### Scenario: 見開き画像表示時
- **WHEN** ユーザーが見開きモードで画像を閲覧している
- **THEN** 結合された見開き画像（行）の垂直方向の中心が、ビューポートの垂直方向の中心と一致するように配置される

