## MODIFIED Requirements

### Requirement: Dual Page Rendering
システムは、「見開きモード（Dual Page Mode）」が有効で、かつ連続する2枚の画像が縦長（portrait）である場合、それらを横並びに描画しなければならない（SHALL）。
ただし、**第1ページ（インデックス 0）および最終ページについては、画像の向きに関わらず常に単一ページとして描画しなければならない（MUST）**。
レイアウトは日本の漫画の読み方向（右綴じ）に従い、前のページ（インデックスN）を**右側**に、次のページ（インデックスN+1）を**左側**に配置しなければならない（MUST）。
ペアリングの基準は `spreadOffset` 状態（0 または 1）によって決定され、現在のスクロール位置によって動的に変動してはならない（SHALL）。

#### Scenario: Rendering two portrait images (Offset 0)
- **WHEN** 見開きモードが有効で、spreadOffset = 0 の場合
- **AND** 画像0と画像1が縦長である
- **THEN** 画像0は第1ページであるため単独で表示される
- **AND** 画像1（右）と画像2（左）がペアとして表示される

#### Scenario: Rendering two portrait images (Offset 1)
- **WHEN** 見開きモードが有効で、spreadOffset = 1 の場合
- **AND** 画像0、画像1、画像2がすべて縦長である
- **THEN** 画像0は第1ページであるため単独で表示される
- **AND** 画像1はオフセットの影響で単独で表示される
- **AND** 画像2（右）と画像3（左）がペアとして表示される

#### Scenario: Rendering the first page alone
- **WHEN** 見開きモードが有効で、全ての画像が縦長である
- **THEN** インデックス 0 の画像（第1ページ）は常に単独で中央に表示される

#### Scenario: Rendering the last page alone
- **WHEN** 見開きモードが有効で、全 N 枚の画像がある
- **THEN** インデックス N-1 の画像（最終ページ）は、たとえ前のページとペアを組める条件であっても、常に単独で中央に表示される
