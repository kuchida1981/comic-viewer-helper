## Context

現在のキーボード・ショートカットは `src/shortcuts.js` の `SHORTCUTS` 配列で集約定義され、`src/managers/InputManager.js` の `onKeyDown` で `isKey(id)` パターンで処理される。ラベルや説明文は `src/i18n.js` の辞書キーから取得され、HelpModal には自動で表示される。

ランダムジャンプの発火ロジック自体は `src/managers/UIManager.js` に存在し、GUIボタンのクリックハンドラから呼び出される。キーボード発火も同じロジックを再利用する。

## Goals / Non-Goals

**Goals:**
- 既存のショートカット管理パターンに沿って、最小限の変更でキーボード発火を追加する
- ショートカットが HelpModal に自動で表示される

**Non-Goals:**
- キーの割り当てをユーザーがカスタマイズできる仕組みの導入
- ランダムジャンプロジックそのもの（選択アルゴリズム、プライベート作品の除外など）の変更

## Decisions

### キー選択の制約
既存割り当て済みキー (`j`, `k`, `d`, `o`, `i`, `f`, `?`) との衝突を避け、右手側キーを優先する。候補は `p`, `l`, `u` など（詳細は #114 で議論中）。最終決定は実装直前に行う。

### 実装パターン: 既存パターンに追随
新規のハンドラ機構を作らず、以下の既存パターンに追加するだけにする。

1. `src/shortcuts.js`: `SHORTCUTS` 配列に新エントリ（id: `randomJump`）を追加
2. `src/managers/InputManager.js`: `onKeyDown` に `isKey('randomJump')` の判定を追加し、UIManager の発火メソッドを呼び出す
3. `src/i18n.js`: `ja` / `en` の辞書に label・desc を追加

**理由:** 既存パターンが成熟ており、HelpModal への自動表示も含めて全て既存の仕組みで動作する。別途機構を導入する必要はない。

## Risks / Trade-offs

- [キー選択が遅延する] → キー候補は #114 で事前に絞り込んでおき、実装直前に決定する
- [ブラウザやサイト側のデフォルトキー動作と衝突する] → 候補キーは `InputManager` で既に `ctrlKey / metaKey / altKey` を除外しているため、修飾キーなしの単一キーの衝突リスクは低い。最終キー選定時に確認する