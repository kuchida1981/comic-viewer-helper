## MODIFIED Requirements

### Requirement: Modal Dismissal
ユーザーは、モーダルを簡単に閉じることができなければならない（SHALL）。

#### Scenario: モーダルを閉じる
- **WHEN** ユーザーがモーダル内の「Close」ボタンをクリックする
- **OR** ユーザーがモーダルの外側（オーバーレイ部分）をクリックする
- **OR** ユーザーが Esc キーを押す
- **OR** モーダルが表示されている状態で 'i' キーを押す
- **THEN** モーダルが閉じ、元の閲覧画面に戻る
