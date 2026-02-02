## ADDED Requirements

### Requirement: GUI位置モードの管理
システムは、GUI表示位置のモード（記憶モード／固定モード）を管理しなければならない（MUST）。

#### Scenario: デフォルトは記憶モード
- **WHEN** ユーザーが初めてアプリケーションを使用する
- **THEN** GUI位置モードは「記憶モード」である

#### Scenario: GUI位置モードをlocalStorageに保存
- **WHEN** ユーザーがGUI位置モードを変更する
- **THEN** 選択されたモードがlocalStorageに保存される

#### Scenario: GUI位置モードをlocalStorageから復元
- **WHEN** ページが読み込まれる
- **THEN** localStorageからGUI位置モードが読み込まれる

### Requirement: 記憶モードの動作
記憶モードでは、GUIの位置がlocalStorageに保存され、次回ページ表示時に復元されなければならない（MUST）。

#### Scenario: ドラッグ後の位置を保存
- **WHEN** 記憶モードが有効で、ユーザーがGUIをドラッグして位置を変更する
- **THEN** 新しい位置がlocalStorageに保存される

#### Scenario: 保存された位置を復元
- **WHEN** 記憶モードが有効で、ページが読み込まれる
- **THEN** GUIはlocalStorageに保存された位置に表示される

#### Scenario: 保存された位置がない場合
- **WHEN** 記憶モードが有効で、localStorageにGUI位置が保存されていない
- **THEN** GUIはデフォルト位置に表示される

### Requirement: 固定モードの動作
固定モードでは、GUIが常に画面右下の固定位置に表示され、位置の変更はlocalStorageに保存されないこと（MUST NOT）。

#### Scenario: 固定位置に表示
- **WHEN** 固定モードが有効で、ページが読み込まれる
- **THEN** GUIは画面右下の固定位置（`top: innerHeight - 150, left: innerWidth - 220`）に表示される

#### Scenario: ドラッグしても位置を保存しない
- **WHEN** 固定モードが有効で、ユーザーがGUIをドラッグして位置を変更する
- **THEN** GUIはドラッグされた位置に移動するが、localStorageには保存されない

#### Scenario: 次回表示時は固定位置に戻る
- **WHEN** 固定モードが有効で、前回ドラッグして位置を変更した後、ページを再読み込みする
- **THEN** GUIは固定位置に表示される（ドラッグした位置は記憶されていない）

### Requirement: モード切り替え時の動作
GUI位置モードを切り替えた際の動作を定義する。

#### Scenario: 記憶モードから固定モードへの切り替え
- **WHEN** ユーザーが記憶モードから固定モードに切り替える
- **THEN** 設定変更時点ではGUIの位置は変わらない
- **THEN** 次回ページ表示時からGUIは固定位置に表示される

#### Scenario: 固定モードから記憶モードへの切り替え
- **WHEN** ユーザーが固定モードから記憶モードに切り替える
- **THEN** 現在のGUI位置がlocalStorageに保存される
- **THEN** 設定変更時点ではGUIの位置は変わらない
- **THEN** 次回ページ表示時から保存された位置が使用される

### Requirement: ウィンドウリサイズ時の対応
固定モードでは、ウィンドウリサイズ時にGUIの固定位置が適切に調整されなければならない（MUST）。

#### Scenario: ウィンドウリサイズ後の固定位置
- **WHEN** 固定モードが有効で、ウィンドウサイズが変更される
- **THEN** GUIは新しいウィンドウサイズに基づいた固定位置（右下）にクランプされる
