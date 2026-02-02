# Tasks: Resume Reading Position

## 1. ResumeManager クラスの実装

- [ ] 1.1 `src/managers/ResumeManager.js` ファイルを作成
- [ ] 1.2 ResumeManager クラスの基本構造を実装（constructor、store参照）
- [ ] 1.3 isEnabled() メソッドを実装（Store.resumeEnabled を参照）
- [ ] 1.4 _loadData() メソッドを実装（localStorage からデータ読み込み、エラーハンドリング）
- [ ] 1.5 savePosition(url, pageIndex) メソッドを実装（isEnabled チェック、データ保存）
- [ ] 1.6 loadPosition(url) メソッドを実装（isEnabled チェック、データ読み込み、null 返却）
- [ ] 1.7 clearAll() メソッドを実装（全データ削除）
- [ ] 1.8 ResumeManager.test.js を作成し、全メソッドの単体テストを実装

## 2. Store の拡張

- [ ] 2.1 `src/store.js` の STORAGE_KEYS に RESUME_ENABLED を追加
- [ ] 2.2 StoreState typedef に resumeEnabled: boolean を追加
- [ ] 2.3 Store.state の初期化に resumeEnabled を追加（デフォルト true）
- [ ] 2.4 Store.setState() の永続化ロジックに resumeEnabled 処理を追加
- [ ] 2.5 store.test.js に resumeEnabled のテストを追加

## 3. ResumeToggle コンポーネントの実装

- [ ] 3.1 `src/ui/components/ResumeToggle.js` ファイルを作成
- [ ] 3.2 createResumeToggle() 関数を実装（checkbox、label、div 要素の構築）
- [ ] 3.3 onToggle イベントハンドラを実装（checked 状態を callback に渡す）
- [ ] 3.4 update() メソッドを実装（Store の変更に応じて checkbox.checked を更新）
- [ ] 3.5 blur() 処理を追加（操作後にフォーカス解除）
- [ ] 3.6 components.test.js に ResumeToggle のテストを追加

## 4. ResumeNotification コンポーネントの実装

- [ ] 4.1 `src/ui/components/ResumeNotification.js` ファイルを作成
- [ ] 4.2 createResumeNotification() 関数のシグネチャを定義（savedIndex、totalPages、onResume、onSkip）
- [ ] 4.3 メッセージ表示を実装（"Nページから再開しますか?"）
- [ ] 4.4 「続きから」ボタンを実装（onResume callback 呼び出し + cleanup）
- [ ] 4.5 「最初から」ボタンを実装（onSkip callback 呼び出し + cleanup）
- [ ] 4.6 「×」ボタンを実装（cleanup のみ）
- [ ] 4.7 cleanup() 関数を実装（タイマークリア、イベントリスナー削除、DOM削除）
- [ ] 4.8 15秒タイムアウトを実装（setTimeout + cleanup）
- [ ] 4.9 スクロール開始検知を実装（window scroll イベント + cleanup）
- [ ] 4.10 components.test.js に ResumeNotification のテストを追加

## 5. スタイルの追加

- [ ] 5.1 `src/ui/styles.js` に ResumeToggle のスタイルを追加（既存の SpreadControls と統一）
- [ ] 5.2 ResumeNotification のスタイルを追加（position: fixed、bottom: 10px、中央揃え）
- [ ] 5.3 ResumeNotification のボタンスタイルを追加（hover状態を含む）
- [ ] 5.4 z-index: 10002 を設定（ProgressBar より上）

## 6. i18n 対応

- [ ] 6.1 `src/i18n.js` の messages.en.ui に resume、resumeNotification、continueReading、startFromBeginning を追加
- [ ] 6.2 messages.ja.ui に対応する日本語メッセージを追加
- [ ] 6.3 ResumeToggle で t('ui.resume') を使用
- [ ] 6.4 ResumeNotification で t('ui.resumeNotification') 等を使用
- [ ] 6.5 i18n.test.js にメッセージの存在確認テストを追加

## 7. UIManager の拡張

- [ ] 7.1 `src/managers/UIManager.js` に createResumeToggle のインポートを追加
- [ ] 7.2 UIManager.resumeToggleComp プロパティを追加
- [ ] 7.3 updateUI() 内で ResumeToggle を初期化（SpreadControls の直後に配置）
- [ ] 7.4 ResumeToggle の onToggle callback を実装（Store.setState({ resumeEnabled }) 呼び出し）
- [ ] 7.5 Store の変更に応じて resumeToggleComp.update() を呼び出す
- [ ] 7.6 showResumeNotification(savedIndex) メソッドを実装
- [ ] 7.7 showResumeNotification() 内で createResumeNotification() を呼び出し
- [ ] 7.8 onResume callback で navigator.jumpToPage(savedIndex + 1) を呼び出す
- [ ] 7.9 通知を document.body に appendChild
- [ ] 7.10 UIManager.test.js にテストを追加

## 8. main.js の統合

- [ ] 8.1 `src/main.js` に ResumeManager のインポートを追加
- [ ] 8.2 App.constructor() で this.resumeManager を初期化
- [ ] 8.3 App.init() 内で復元ロジックを実装（workKey 生成）
- [ ] 8.4 resumeManager.isEnabled() をチェック
- [ ] 8.5 resumeManager.loadPosition(workKey) を呼び出し
- [ ] 8.6 savedIndex が null でない場合、uiManager.showResumeNotification() を呼び出す
- [ ] 8.7 beforeunload イベントリスナーを追加
- [ ] 8.8 beforeunload 内で resumeManager.savePosition() を呼び出す（workKey、currentVisibleIndex）

## 9. 統合テスト

- [ ] 9.1 エンドツーエンドのテストシナリオを作成（保存→離脱→復元）
- [ ] 9.2 resumeEnabled が false の場合の動作をテスト（保存・復元しない）
- [ ] 9.3 localStorage が空の場合の動作をテスト（通知表示なし）
- [ ] 9.4 localStorage が破損している場合の動作をテスト（エラーハンドリング）
- [ ] 9.5 トースト通知のボタン操作をテスト（続きから、最初から、×）
- [ ] 9.6 タイムアウト・スクロールによる自動削除をテスト

## 10. ドキュメント更新

- [ ] 10.1 README.md に Resume 機能の説明を追加
- [ ] 10.2 使用方法（設定トグル、復元フロー）を記載
- [ ] 10.3 プライバシーに関する注意事項を記載（localStorage 使用）
