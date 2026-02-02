# Spec: Resume Toggle

レジューム機能のON/OFF設定トグルの仕様

## ADDED Requirements

### Requirement: レジューム機能の有効/無効状態を管理する
システムは、レジューム機能の有効/無効状態をStoreで管理しなければならない。

#### Scenario: デフォルト状態の読み込み
- **WHEN** アプリケーションが初期化される
- **THEN** システムは localStorage から 'comic-viewer-helper-resume-enabled' を読み込み、Store.resumeEnabled に設定する

#### Scenario: 保存された設定がない場合のデフォルト値
- **WHEN** localStorage に設定が保存されていない
- **THEN** システムは resumeEnabled を true に設定する

#### Scenario: 状態変更時の永続化
- **WHEN** ユーザーが設定トグルを操作して resumeEnabled を変更した
- **THEN** システムは新しい値を localStorage に保存する

### Requirement: 設定トグルUIを提供する
システムは、GUIパネル内にレジューム機能のON/OFFを切り替えるチェックボックスを提供しなければならない。

#### Scenario: トグルUIの配置
- **WHEN** GUIパネルが表示される
- **THEN** システムは SpreadControls の直後に ResumeToggle を配置する

#### Scenario: チェックボックスの初期状態
- **WHEN** ResumeToggle が初期化される
- **THEN** チェックボックスの checked 状態は Store.resumeEnabled の値と一致する

#### Scenario: ラベルの表示
- **WHEN** ResumeToggle が表示される
- **THEN** ラベルは "Resume" と表示される（i18n対応）

### Requirement: トグル操作で状態を変更できる
システムは、チェックボックスの操作でレジューム機能の有効/無効を切り替えられなければならない。

#### Scenario: チェックボックスをONにする
- **WHEN** ユーザーがチェックボックスをONにした
- **THEN** システムは Store.resumeEnabled を true に設定する

#### Scenario: チェックボックスをOFFにする
- **WHEN** ユーザーがチェックボックスをOFFにした
- **THEN** システムは Store.resumeEnabled を false に設定する

#### Scenario: 操作後のフォーカス解除
- **WHEN** ユーザーがチェックボックスを操作した
- **THEN** システムは自動的にチェックボックスのフォーカスを外す

### Requirement: Store状態の変更に応答する
システムは、Store.resumeEnabled の変更に応じてUIを更新しなければならない。

#### Scenario: 外部からの状態変更を反映
- **WHEN** Store.resumeEnabled が外部から変更された
- **THEN** チェックボックスの checked 状態が新しい値に更新される

### Requirement: 無効時は保存・復元を行わない
システムは、resumeEnabled が false の場合、すべての保存・復元処理をスキップしなければならない。

#### Scenario: 無効時にページ離脱
- **WHEN** resumeEnabled が false でユーザーがページから離脱した
- **THEN** システムは読書位置を保存しない

#### Scenario: 無効時にページ初期化
- **WHEN** resumeEnabled が false でページが初期化された
- **THEN** システムは保存位置の読み込みもトースト通知の表示も行わない

#### Scenario: 閲覧中に無効化
- **WHEN** ユーザーが閲覧中に resumeEnabled を false に変更した
- **THEN** 以降の離脱時には読書位置が保存されない

#### Scenario: 閲覧中に有効化
- **WHEN** ユーザーが閲覧中に resumeEnabled を true に変更した
- **THEN** 以降の離脱時には読書位置が保存される
