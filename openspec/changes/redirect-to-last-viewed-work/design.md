# Design

## Context

動機とスコープは proposal.md を参照。現状の構造は次のとおり。

- `src/main.ts` は読み込み時に `new App()` を生成する。`App` のコンストラクタが Adapter 選択（現状は `DefaultAdapter` のみ、`match` は常に `true`）と `Store`・各 Manager の生成を行い、`init()` は `adapter.getContainer()` が `null` なら何もせず戻る。
- `SiteAdapter` には「作品ページか」を判定する手段がない。`getContainer()` は DOM 判定で、DOM 構築後でないと使えない。
- 閲覧履歴 `luckyHistory`（`HistoryEntry[]`、`href` は正規化済み、`lastViewedAt` を持つ）はホスト別の GM ストレージに保存され、作品ページの `init()` で追加される。
- 読書位置は `ResumeManager` が作品 URL（`origin + pathname`）ごとに `pageIndex` を保存し、作品ページの `init()` で再開通知を出す。
- `@run-at` は現在 `document-idle`。`main.ts` は `document.readyState === 'loading'` のとき `DOMContentLoaded` まで `init` を待つ分岐をすでに持っている。

## Goals / Non-Goals

**Goals:**
- パスの決め打ちをコアに持たず、作品ページ判定を Adapter に閉じ込める。
- DOM を待たずに（`document-start` で）判定・遷移し、ちらつきを避ける。
- 発動条件の判定を `src/logic.ts` の純粋関数に切り出し、100% カバレッジでテストする。
- 既存の履歴（`luckyHistory`）と再開通知（`ResumeManager`）を変更せず再利用する。

**Non-Goals:**
- ページ位置の自動ジャンプ（再開通知に任せる）。
- ON/OFF 設定の Gist 同期（`SyncManager` のスキーマは変更しない）。
- DOM 判定（`getContainer`）による作品ページ判定との併用。
- 複数サイト向けの追加 Adapter の実装（インターフェースのみ対応）。

## Decisions

### D1: `SiteAdapter.isWorkPage(url: string): boolean` を必須メソッドとして追加する
作品ページ判定は URL のみに基づく Adapter のメソッドとする。`DefaultAdapter` は URL の `pathname` が `/magazine/` または `/fanzine/` で始まり、その後ろに 1 文字以上続くことを作品ページとする（現行の `@match` と同じ定義）。

- 代替案 A: `getContainer()` の有無（DOM 判定）。パス構造に依存しない反面、`DOMContentLoaded` 後でないと判定できずちらつきが避けられない。作品ページなのに DOM が取れない場合に誤ってリダイレクトするリスクもある。
- 代替案 B: パスの設定をユーザーが登録する方式。設定コストが高く、デフォルト空だと機能しない。
- 採用理由: サイトごとの差異は既存どおり Adapter が吸収する設計に沿い、`document-start` で判定できる。`isWorkPage` を必須にして、新しい Adapter の実装漏れを型で検出する（現状 Adapter は 1 つだけなので影響は小さい）。

### D2: リダイレクト先の決定を純粋関数 `resolveRedirectTarget` にする（`src/logic.ts`）
入力はすべてプリミティブと関数で渡し、DOM・GM に触れない。

```ts
interface RedirectContext {
  enabled: boolean;
  currentUrl: string;
  referrer: string;                 // document.referrer
  navigationType: string;           // 'navigate' | 'reload' | 'back_forward' | 'prerender' | ''
  history: { href: string; lastViewedAt: number }[];
  isWorkUrl: (url: string) => boolean; // adapter.isWorkPage
}
function resolveRedirectTarget(ctx: RedirectContext): string | null
```

判定順: 無効 → 現在が作品ページ → リロード/戻る進む → 同一オリジンのリファラ → 履歴が空 → 最新エントリを選択（`lastViewedAt` 最大）→ 遷移先が現在 URL と同一（`normalizeUrl` で比較）→ 遷移先が作品ページでない、のいずれかで `null`。それ以外は遷移先の URL を返す。

- 同一オリジン判定は `referrer` が空文字なら外部扱い、空でなければ `new URL(referrer).origin` と `currentUrl` の origin を比較する。パース失敗は外部扱いとする。
- 「最後に閲覧」は配列の先頭ではなく `lastViewedAt` 最大で選ぶ（同期等で並びが崩れても正しく選べる）。
- 遷移先が作品ページであることを要求するため、履歴に作品ページ以外が混入しても作品ページ以外同士でループしない。作品ページはリダイレクトしないため、ループは構造的に起きない（セッションフラグは不要）。

### D3: `RedirectManager` と `main.ts` のブートストラップ
`main.ts` で Adapter を選択し、`adapter.isWorkPage(location.href)` で分岐する。

- 作品ページ以外: `Store` を生成し、`RedirectManager.run()` のみ実行して戻る。`App`（`SyncManager`・`UIManager` 等）は生成しない。
- 作品ページ: 従来どおり `App` を生成する。Adapter は `App` のコンストラクタ引数で受け取る。

`RedirectManager` は `Store` から `redirectEnabled` と `luckyHistory` を読み、`document.referrer`・`performance.getEntriesByType('navigation')[0]?.type` を集めて `resolveRedirectTarget` を呼び、結果があれば `location.replace(target)` を実行する。

- `Store` の `luckyHistory` は GM ストレージからの同期読み込みなので `document-start` でも利用できる。Gist 同期の `pull()` は待たず、ローカルの履歴を使う。

### D4: `@match` をドメイン単位にし、`@run-at` を `document-start` にする
`@match https://something/*` の 1 行にする。リダイレクトの瞬間までページが描画されないようにするため `@run-at document-start` とする。作品ページでは `main.ts` の既存分岐（`readyState === 'loading'` なら `DOMContentLoaded` で `init`）により、DOM 構築後に従来どおり初期化される。

- 代替案: `document-idle` のままにする。ちらつき（元のページが一瞬表示される）が出る。

### D5: 設定の保持
`StoreState` に `isRedirectEnabled: boolean`（デフォルト `false`）を追加し、`STORAGE_KEYS.REDIRECT_ENABLED` で GM ストレージに保存する（`ENABLED` 等と同じくホスト非依存のキー）。設定 UI は作品ページ側の既存の設定領域（`SyncSettings` 付近）に ON/OFF のチェックボックスを追加する。文言は `src/i18n.ts` に日英で追加する。`syncableKeys` には含めない。

## Risks / Trade-offs

- [`document-start` で `Store`/`App` のコンストラクタが DOM（`document.body` 等）に触れて失敗する] → 実装時に `App` の生成が DOM 非依存であることを確認し、依存があれば `init()` 側へ寄せる。作品ページの既存テストと実機（作品ページ）で動作を確認する。
- [`DefaultAdapter` の作品ページのパス定義が、実サイトのタグ/一覧ページと衝突する（`DefaultAdapter` のタグ種別判定には `magazine`・`fanzine` も含まれている）] → 本チェンジでは既存の `@match` 定義（`/magazine/*`・`/fanzine/*`）を作品ページとみなす。実機検証で衝突が確認された場合は `isWorkPage` のルールのみを調整する。
- [サイト内遷移のつもりでもリファラが付かない（`Referrer-Policy: no-referrer`、ブックマークレット等）ためリダイレクトされる] → デフォルト OFF とし、ユーザーが明示的に有効にした場合のみ動作させる。
- [`@match` を広げることで、作品ページ以外でもスクリプトが実行される] → 作品ページ以外では `Store` の生成と判定のみを行い、他の機能は初期化しない。
- [Gist 同期前のローカル履歴でリダイレクト先が決まる] → 別端末の最新の閲覧は反映されない場合がある。許容する。

## Migration Plan

- 既存ユーザーは設定がデフォルト OFF のため、挙動は変わらない。
- Tampermonkey の `@match`・`@run-at` はスクリプト更新時に反映される。ユーザーが `@match` のドメインを書き換えている場合は、README の説明に従って再設定する。
- ロールバックは `@match`・`@run-at` を元に戻し、`RedirectManager` の呼び出しを外すだけで済む。保存データの移行は不要。
