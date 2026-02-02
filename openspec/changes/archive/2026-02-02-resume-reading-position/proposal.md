# Proposal: Resume Reading Position

## 概要

読書体験を向上させるため、前回閲覧していたページを記憶し、再度同じURL（作品）を開いた際にその位置から再開できる機能を追加します。

## 関連イシュー

- #41

## 背景

現在、ユーザーが作品を途中まで読んで離脱した場合、次回訪問時には常に1ページ目から開始されます。これにより、前回の続きから読むために手動でスクロールまたはページジャンプする必要があり、UXが低下しています。

特に長編作品や複数回に分けて読む場合、この機能があることで読書体験が大きく向上します。

## 目標

1. **読書位置の自動記憶**: ユーザーが作品を閲覧中、現在のページ位置を自動的に記憶する
2. **復元の選択肢**: 次回訪問時、保存された位置から再開するか、最初から読むかを選択できる
3. **プライバシー配慮**: 機能のON/OFF切り替えをGUIで提供する
4. **シームレスな統合**: 既存の機能（Spread View、ページカウンター等）と自然に連携する

## スコープ

### 含むもの

- ページ位置の localStorage への保存・読み込み
- 復元確認UIの実装（トースト通知）
- 設定トグルスイッチの追加
- ResumeManager クラスの実装
- 既存コンポーネントとの統合

### 含まないもの

- データクリーンアップ機能（将来的な拡張として検討）
- 複数デバイス間での同期
- 読書履歴の一覧表示
- ページ位置以外のメタデータ（読了日時、メモ等）

## 設計概要

### データ構造

```javascript
// localStorage['comic-viewer-helper-resume-data']
{
  "https://example.com/post/123456": { pageIndex: 47 },
  "https://example.com/post/789012": { pageIndex: 12 }
}

// localStorage['comic-viewer-helper-resume-enabled']
"true" | "false"
```

### キー生成

```javascript
const workKey = window.location.origin + window.location.pathname;
// 例: "https://example.com/post/123456"
```

**理由:**
- `origin + pathname` で一意性を保証
- クエリパラメータは除外（ページ番号等の動的パラメータを含まない）
- 将来的に他のサイトへ対応する際も追加実装不要

### 保存タイミング

```javascript
window.addEventListener('beforeunload', () => {
  if (resumeManager.isEnabled()) {
    const currentIndex = store.getState().currentVisibleIndex;
    resumeManager.savePosition(workKey, currentIndex);
  }
});
```

**理由:**
- ページ離脱時に1回だけ保存（localStorage への書き込み頻度を最小化）
- シンプルで確実
- ブラウザクラッシュ時は保存されないが、通常の使用では十分

### 復元フロー

```
1. app.init() 実行
2. resumeManager.isEnabled() チェック
3. 保存データがあれば ResumeNotification（トースト）を表示
   - "47ページから再開しますか? [続きから] [最初から] [×]"
4. ユーザーの選択:
   a. [続きから] → navigator.jumpToPage(savedIndex + 1)
   b. [最初から] → 何もしない（1ページ目のまま）
   c. [×] または 15秒タイムアウト → 何もしない
5. いずれの場合も、今回の閲覧終了時には最新位置を保存
```

### UI配置

#### 復元トースト通知
- **位置**: 画面下部中央 (`position: fixed; bottom: 10px; left: 50%; transform: translateX(-50%)`)
- **z-index**: 10002（ProgressBar より上）
- **自動消去**: 15秒後 OR スクロール開始 OR ボタンクリック

#### 設定トグル
- **位置**: GUIパネル内、SpreadControls の直後
- **ラベル**: "Resume"（i18n 対応）
- **状態**: Store.resumeEnabled に連動

### 実装構造

#### 新規クラス: ResumeManager

```javascript
class ResumeManager {
  constructor(store) {
    this.store = store;
    this.storageKey = 'comic-viewer-helper-resume-data';
  }

  isEnabled() {
    return this.store.getState().resumeEnabled;
  }

  savePosition(url, pageIndex) {
    if (!this.isEnabled()) return;
    const data = this._loadData();
    data[url] = { pageIndex };
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  loadPosition(url) {
    if (!this.isEnabled()) return null;
    const data = this._loadData();
    return data[url]?.pageIndex ?? null;
  }

  _loadData() {
    try {
      return JSON.parse(localStorage.getItem(this.storageKey) || '{}');
    } catch {
      return {};
    }
  }

  clearAll() {
    localStorage.removeItem(this.storageKey);
  }
}
```

#### 新規コンポーネント: ResumeToggle

SpreadControls と同様のパターンで実装。

#### 新規コンポーネント: ResumeNotification

トースト通知UI。ボタンクリック、スクロール、タイムアウトで自動削除。

## 技術的考慮事項

### localStorage 容量
- 5-10MB の制限があるが、URL + pageIndex のペアは非常に小さい（約50-100バイト/エントリ）
- 初期バージョンではクリーンアップなしでも実用上問題なし
- 将来的に必要であれば、LRUや期限ベースのクリーンアップを追加

### 既存コードとの連携
- `Store`: `resumeEnabled` 状態を追加
- `Navigator`: 既存の `jumpToPage()` を利用
- `UIManager`: `ResumeToggle` と `ResumeNotification` を統合
- `main.js`: `beforeunload` イベントリスナーを追加

### エッジケース
- **保存データなし**: トースト通知を表示しない
- **resumeEnabled が false**: 保存・復元を一切行わない
- **無効なページインデックス**: `jumpToPage()` が失敗した場合は何もしない
- **localStorage エラー**: try-catch で安全に処理

## 成功基準

1. ✅ ユーザーが作品を途中まで読んで離脱した後、次回訪問時に復元トーストが表示される
2. ✅ 「続きから」ボタンで保存された位置にジャンプできる
3. ✅ 「最初から」ボタンで1ページ目から読める
4. ✅ 設定トグルで機能をON/OFF切り替えできる
5. ✅ 既存機能（Spread View、ナビゲーション等）と干渉しない
6. ✅ localStorage への保存・読み込みが正常に動作する

## リスクと軽減策

### リスク1: localStorage 容量超過
- **軽減策**: 初期バージョンでは考慮不要（実用上十分）。将来的に問題が報告されたら対応。

### リスク2: プライバシー懸念
- **軽減策**: デフォルトON/OFFは要検討。設定トグルで明示的に制御可能。

### リスク3: 既存UIとの干渉
- **軽減策**: トースト通知は一時的（15秒）で、z-index を適切に設定。

## 代替案

### 代替案1: 自動復元（確認なし）
- **却下理由**: ユーザーが最初から読み直したい場合に不便

### 代替案2: タイトルをキーとして使用
- **却下理由**: タイトルの一意性が保証されない、"Unknown Title" の問題

### 代替案3: スクロール時にリアルタイム保存
- **却下理由**: localStorage への書き込み頻度が高すぎる

## 次のステップ

1. Design artifact で詳細な実装設計を策定
2. Tasks artifact でタスク分割
3. 実装・テスト
4. ユーザーフィードバック収集
5. 必要に応じてクリーンアップ機能を追加（将来）

## 関連リソース

- Issue #41: レジューム機能：最後に読んだページ位置の記憶と自動復元
- 既存コード: `src/store.js`, `src/managers/Navigator.js`, `src/managers/UIManager.js`
- 参考: SpreadControls, HelpModal の実装パターン
