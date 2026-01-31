## MODIFIED Requirements

### Requirement: Dual Page Rendering
システムは、「見開きモード（Dual Page Mode）」が有効で、かつ連続する2枚の画像が縦長（portrait）である場合、それらを横並びに描画しなければならない（SHALL）。
レイアウトは日本の漫画の読み方向（右綴じ）に従い、前のページ（インデックスN）を**右側**に、次のページ（インデックスN+1）を**左側**に配置しなければならない（MUST）。
ペアリングの基準は `spreadOffset` 状態（0 または 1）によって決定され、現在のスクロール位置によって動的に変動してはならない（SHALL）。

#### Scenario: Rendering two portrait images (Offset 0)
- **WHEN** 見開きモードが有効で、spreadOffset = 0 の場合
- **AND** 画像0と画像1が縦長である
- **THEN** 画像0が右側に表示される
- **AND** 画像1が左側に表示される

#### Scenario: Rendering two portrait images (Offset 1)
- **WHEN** 見開きモードが有効で、spreadOffset = 1 の場合
- **AND** 画像0が縦長である
- **THEN** 画像0は単独で表示される（オフセットによりペアリング対象から外れるため）
- **AND** 画像1（右）と画像2（左）がペアとして表示される

### Requirement: Mode Toggling
システムは、ナビゲーションバー上のGUIコントロール（ボタンやチェックボックスなど）を通じて、見開きモードのON/OFFを切り替える機能を提供しなければならない（SHALL）。
単一ページモードから見開きモードへ切り替える際、システムは現在フォーカスされているページが（可能であれば）スプレッドの開始側（右側）に表示されるよう、初期 `spreadOffset` （0 または 1）を自動的に計算・設定しなければならない（SHALL）。初期計算後は、手動調整または無効化されるまで、オフセットは固定されなければならない（MUST）。

#### Scenario: Enabling Dual Page Mode (Auto-Offset)
- **WHEN** ユーザーがページ5を見ている状態でトグルを有効にする
- **THEN** システムは、ページ5が見開きの開始ページとなるように Offset=1 を必要と判定する（標準ペアリングが [4-5] だと仮定した場合）
- **AND** spreadOffset=1 で再描画される
- **AND** ページ5が右側に表示される

#### Scenario: Disabling Dual Page Mode
- **WHEN** ユーザーがトグルを無効にする（現在ON）
- **THEN** 単一ページレイアウトで再描画される
- **AND** トグルの状態表示が "OFF" になる