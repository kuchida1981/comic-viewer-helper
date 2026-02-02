# Design: Resume Reading Position

## Context

現在のアプリケーションは、Store、Navigator、UIManager の3つの主要なマネージャークラスで構成されています。Store が状態を管理し、Navigator がページナビゲーションを担当し、UIManager がUIコンポーネントのライフサイクルを管理しています。

既存のコンポーネント（SpreadControls、HelpModal、MetadataModal等）は、すべて関数ベースのファクトリパターン（`createXxx()` 関数が `{ el, update }` を返す）で実装されています。

localStorage への永続化は、Store クラス内で個別の状態（enabled、isDualViewEnabled、guiPos）ごとに行われており、各状態は独立した STORAGE_KEYS で管理されています。

## Goals / Non-Goals

**Goals:**
- 既存のアーキテクチャパターンに準拠した実装
- Store、Navigator、UIManager への自然な統合
- localStorage を使った軽量な永続化
- ユーザーが制御可能な機能（ON/OFF切り替え）
- エラーに強い実装（localStorage 失敗、不正データ等）

**Non-Goals:**
- 既存アーキテクチャの変更（新しいパターンの導入は避ける）
- リアルタイム同期や複雑な状態管理
- データクリーンアップ機能（初期バージョン）
- 複数デバイス間の同期
- 詳細な読書統計やメタデータ

## Decisions

### Decision 1: ResumeManager を独立したクラスとして実装

**選択:** ResumeManager を Store から独立したクラスとして実装する

**理由:**
- 単一責任の原則: Store は状態管理、ResumeManager はデータ永続化を担当
- テストのしやすさ: ResumeManager を独立してテストできる
- 拡張性: 将来的にクリーンアップ機能等を追加しやすい

**代替案:**
- Store にメソッドを追加: 却下。Store が肥大化し、責任が混在する
- グローバル関数として実装: 却下。状態（store 参照）を持つため、クラスの方が適切

**実装:**
```javascript
// src/managers/ResumeManager.js
export class ResumeManager {
  constructor(store) {
    this.store = store;
    this.storageKey = 'comic-viewer-helper-resume-data';
  }

  isEnabled() { ... }
  savePosition(url, pageIndex) { ... }
  loadPosition(url) { ... }
  _loadData() { ... }
  clearAll() { ... }
}
```

### Decision 2: Store に resumeEnabled 状態を追加

**選択:** Store.state に `resumeEnabled` フィールドを追加し、既存の永続化パターンに従う

**理由:**
- 既存の enabled、isDualViewEnabled と同じパターン
- UIコンポーネントが Store の変更を subscribe できる
- localStorage への永続化が統一的

**実装:**
```javascript
// src/store.js
export const STORAGE_KEYS = {
  // ... existing keys
  RESUME_ENABLED: 'comic-viewer-helper-resume-enabled'
};

// Store.state に追加
this.state = {
  // ... existing state
  resumeEnabled: localStorage.getItem(STORAGE_KEYS.RESUME_ENABLED) !== 'false'
};

// Store.setState() の永続化ロジックに追加
if ('resumeEnabled' in patch) {
  localStorage.setItem(STORAGE_KEYS.RESUME_ENABLED, String(patch.resumeEnabled));
}
```

**デフォルト値:** `true`（機能を有効にして出荷）
- ユーザーがプライバシーを気にする場合は明示的にOFFにできる
- 既存ユーザーは自動的に機能を利用開始

### Decision 3: UIコンポーネントは既存のファクトリパターンで実装

**選択:** createResumeToggle() と createResumeNotification() を既存パターンで実装

**理由:**
- createSpreadControls() 等の既存コンポーネントと一貫性がある
- UIManager が統一的に扱える
- update() メソッドで Store の変更に対応できる

**実装例:**
```javascript
// src/ui/components/ResumeToggle.js
export function createResumeToggle({ resumeEnabled, onToggle }) {
  const checkbox = createElement('input', {
    type: 'checkbox',
    checked: resumeEnabled,
    events: { change: (e) => onToggle(e.target.checked) }
  });

  const label = createElement('label', { className: 'comic-helper-label' },
    [checkbox, 'Resume']);

  const el = createElement('div', {}, [label]);

  return {
    el,
    update: (enabled) => { checkbox.checked = enabled; }
  };
}
```

**代替案:**
- クラスベースのコンポーネント: 却下。既存パターンとの不一致
- Web Components: 却下。オーバーエンジニアリング

### Decision 4: トースト通知は自己完結型コンポーネント

**選択:** ResumeNotification は表示後、自動削除ロジックを内部で管理する

**理由:**
- タイマー、イベントリスナーのクリーンアップを一箇所で管理
- UIManager の複雑性を増やさない
- 他のモーダル（HelpModal、MetadataModal）とは異なり、一時的な通知であるため

**実装:**
```javascript
export function createResumeNotification({ savedIndex, totalPages, onResume, onSkip }) {
  let timeoutId = null;
  let scrollHandler = null;

  const cleanup = () => {
    if (timeoutId) clearTimeout(timeoutId);
    if (scrollHandler) window.removeEventListener('scroll', scrollHandler);
    el.remove();
  };

  // 15秒後に自動削除
  timeoutId = setTimeout(cleanup, 15000);

  // スクロール開始で削除
  scrollHandler = () => cleanup();
  window.addEventListener('scroll', scrollHandler, { once: true });

  // ボタンクリック時も cleanup
  const resumeBtn = createElement('button', {
    events: { click: () => { onResume(); cleanup(); } }
  });

  // ...
}
```

### Decision 5: App.init() で ResumeManager を初期化し、beforeunload で保存

**選択:** main.js の App クラスで ResumeManager をインスタンス化し、beforeunload イベントを登録

**理由:**
- App クラスが全体のオーケストレーションを担当（既存パターン）
- Navigator、UIManager と同じレイヤーで管理
- beforeunload は1回だけ登録すれば良い

**実装:**
```javascript
// src/main.js
class App {
  constructor() {
    this.store = new Store();
    this.adapter = ...;
    this.navigator = new Navigator(this.adapter, this.store);
    this.uiManager = new UIManager(this.adapter, this.store, this.navigator);
    this.inputManager = new InputManager(this.store, this.navigator);
    this.resumeManager = new ResumeManager(this.store);  // 追加
  }

  init() {
    // ... existing init code

    // Resume notification の表示
    if (this.resumeManager.isEnabled()) {
      const workKey = window.location.origin + window.location.pathname;
      const savedIndex = this.resumeManager.loadPosition(workKey);
      if (savedIndex !== null) {
        this.uiManager.showResumeNotification(savedIndex);
      }
    }

    // beforeunload で保存
    window.addEventListener('beforeunload', () => {
      if (this.resumeManager.isEnabled()) {
        const workKey = window.location.origin + window.location.pathname;
        const currentIndex = this.store.getState().currentVisibleIndex;
        this.resumeManager.savePosition(workKey, currentIndex);
      }
    });
  }
}
```

**代替案:**
- Navigator に ResumeManager を統合: 却下。Navigator はページナビゲーションの責任に集中すべき
- UIManager に統合: 却下。データ永続化はUIの責任ではない

### Decision 6: UIManager に showResumeNotification() メソッドを追加

**選択:** UIManager が ResumeNotification の表示を担当する

**理由:**
- UIManager が他のUI要素（モーダル、トースト等）も管理している
- 一貫性のあるAPI（既存のモーダル表示と同様）
- 通知の表示/非表示をUIManagerが制御

**実装:**
```javascript
// src/managers/UIManager.js
class UIManager {
  // ...

  showResumeNotification(savedIndex) {
    const imgs = this.navigator.getImages();
    const notification = createResumeNotification({
      savedIndex,
      totalPages: imgs.length,
      onResume: () => {
        this.navigator.jumpToPage(savedIndex + 1);  // 0-based → 1-based
      },
      onSkip: () => {
        // 何もしない（最初から読む）
      }
    });
    document.body.appendChild(notification.el);
  }
}
```

### Decision 7: i18n 対応は既存パターンに従う

**選択:** t() 関数を使って "Resume" ラベルを国際化

**理由:**
- SpreadControls 等の既存コンポーネントと同じパターン
- 既存の i18n インフラを活用

**実装:**
```javascript
// src/i18n.js に追加
const messages = {
  en: {
    ui: {
      // ... existing
      resume: 'Resume',
      resumeNotification: 'Resume from page {page}?',
      continueReading: 'Continue',
      startFromBeginning: 'Start Over'
    }
  },
  ja: {
    ui: {
      // ... existing
      resume: 'レジューム',
      resumeNotification: '{page}ページから再開しますか?',
      continueReading: '続きから',
      startFromBeginning: '最初から'
    }
  }
};
```

## Risks / Trade-offs

### Risk 1: localStorage 容量制限

**リスク:** ユーザーが大量の作品を読むと、localStorage の容量（5-10MB）を超える可能性

**軽減策:**
- 1エントリあたり約50-100バイトなので、実用上は10万作品以上読まない限り問題ない
- 初期バージョンではクリーンアップ機能を実装しない（シンプルさを優先）
- 将来的に問題が報告されたら、LRUベースのクリーンアップを追加

**トレードオフ:** シンプルさ vs 完全性

### Risk 2: beforeunload のタイミング

**リスク:** ブラウザクラッシュやタスクキル時には beforeunload が発火しない

**軽減策:**
- 通常の使用（タブを閉じる、別ページに移動）では問題なく動作
- 完璧な保存を保証しないことを受け入れる（UX向上が目的、データ保全ではない）

**トレードオフ:** シンプルさ vs 完全性

### Risk 3: 異なるブラウザ/デバイス間での非同期

**リスク:** ユーザーが複数デバイスで同じ作品を読むと、位置が同期されない

**軽減策:**
- 現時点では localStorage のみを使用（デバイスローカル）
- 将来的にサーバー同期を追加する可能性は残す（が、初期バージョンでは明示的に Non-Goal）

**トレードオフ:** シンプルさ vs 高度な機能

### Risk 4: ページインデックスの信頼性

**リスク:** currentVisibleIndex が不正確な場合（例: 画像読み込み中）、間違った位置を保存する可能性

**軽減策:**
- Navigator.updatePageCounter() が既に getPrimaryVisibleImageIndex() を使って正確に計算している
- beforeunload 時には画像読み込みが完了している可能性が高い
- 仮に不正確でも、次回訪問時にユーザーが「最初から」を選べる

**トレードオフ:** 完全な精度 vs 実用的な精度

### Risk 5: UIの干渉

**リスク:** トースト通知が ProgressBar やサイトの既存要素と視覚的に干渉する

**軽減策:**
- z-index を適切に設定（10002）
- 15秒で自動削除されるため、永続的な干渉ではない
- ユーザーが×ボタンで即座に閉じられる

**トレードオフ:** 通知の可視性 vs UI のクリーンさ

## Migration Plan

### 展開手順

1. **コード実装**
   - ResumeManager クラス
   - ResumeToggle コンポーネント
   - ResumeNotification コンポーネント
   - Store への resumeEnabled 追加
   - UIManager への統合
   - main.js の修正

2. **テスト**
   - ResumeManager の単体テスト
   - UIコンポーネントのテスト
   - 統合テスト（保存→離脱→復元のフロー）

3. **デプロイ**
   - ユーザースクリプトの更新
   - デフォルトで resumeEnabled = true で出荷

4. **ロールバック戦略**
   - 問題が発生した場合、ユーザーは設定トグルでOFFにできる
   - 致命的な問題の場合、localStorage.removeItem() で全データを削除する手順を案内

### 後方互換性

- 既存のユーザー: localStorage に resumeEnabled が存在しない場合、デフォルトで `true` になる
- 既存の状態（enabled、isDualViewEnabled 等）には影響なし
- 新しいキー（RESUME_ENABLED、resume-data）を追加するのみ

## Open Questions

### Q1: デフォルト値は true か false か？

**検討中:** resumeEnabled のデフォルト値を true（有効）にするか、false（無効）にするか

**判断基準:**
- **true の場合:** ユーザーが即座に機能を体験できる。プライバシーを気にする人は手動でOFF
- **false の場合:** よりプライバシー重視。機能を使いたい人は手動でON

**推奨:** `true`（proposal では true を前提に設計されている）

### Q2: トースト通知のメッセージ内容

**検討中:** "47ページから再開しますか?" と具体的なページ番号を表示するか、"前回の続きから読みますか?" と抽象的にするか

**判断基準:**
- ページ番号表示: ユーザーがどこまで読んだか分かる（透明性）
- 抽象的: シンプルだが情報が少ない

**推奨:** ページ番号を表示（より情報的）

### Q3: 設定トグルのラベル

**検討中:** "Resume"、"レジューム"、"読書位置を記憶"、"続きから読む" のどれが最適か

**判断基準:**
- "Resume": 簡潔、既存の "Spread" と統一感
- "読書位置を記憶": 具体的だが長い

**推奨:** "Resume"（簡潔さと一貫性を優先）
