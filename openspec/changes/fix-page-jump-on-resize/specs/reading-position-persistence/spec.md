## ADDED Requirements

### Requirement: Resize Resilience
ブラウザのリサイズ中、システムは現在の `currentVisibleIndex` を正確に維持しなければならない。

#### Scenario: Maintaining position during continuous resize
- **WHEN** ユーザーがブラウザのウィンドウサイズを連続的に変更する
- **THEN** `currentVisibleIndex` はリサイズ開始時の値を維持し、勝手に他のページ番号に書き換わらないこと
- **THEN** リサイズ完了（または各フレームの描画）後、維持されたインデックスに対応する画像がビューポートの中央に正しく表示されること
