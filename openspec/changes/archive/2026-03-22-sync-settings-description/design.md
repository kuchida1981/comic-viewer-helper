## Context

現在の同期設定画面は、ラベルと入力フィールドのみで構成されており、ユーザーが設定手順や各項目の意味を理解するためのガイドが不足している。特に暗号化のパスワード変更や解除の手順が不明確であり、操作ミスによるデータ喪失のリスクがある。

## Goals / Non-Goals

**Goals:**
- 各設定項目に対して、具体的かつ分かりやすい説明テキストをUIに追加する。
- ユーザーがGitHub Gist連携の設定（PATの作成、Gist IDの共有）を迷わず行えるようにする。
- 暗号化の仕様（パスワードを忘れた際のリスク、解除・変更の手順）を明示する。
- 日本語と英語の両方で説明文を提供する。

**Non-Goals:**
- 同期ロジックそのものの変更。
- 外部ドキュメント（GitHubのドキュメント等）へのリンクの追加（今回はUI内テキストでの説明に留める）。

## Decisions

### 1. UI構造の変更
`src/ui/components/SyncSettings.ts` において、各設定項目の `label` と `input` の間に、説明文を表示するための `div` 要素を挿入する。

- **Rationale**: 項目名（ラベル）の直下に説明文を配置することで、ユーザーが入力する際に自然に目に入るようにする。
- **Alternatives**: ツールチップ（ホバー時表示）も検討したが、設定画面を初めて開くユーザーにとって重要な情報であるため、常時表示するインラインテキストを選択した。

### 2. メッセージキーの設計
`src/i18n.ts` に、各設定項目に対応する説明用メッセージキーを追加する。命名規則は既存のラベルキーに `Desc` を付加したものとする（例: `syncPat` -> `syncPatDesc`）。

- **追加するキー**:
    - `syncSettingsDesc` (導入文)
    - `syncPatDesc` (PATの説明)
    - `syncGistIdDesc` (Gist IDの説明)
    - `syncEncryptionModeDesc` (暗号化モードの説明)
    - `syncEncryptionPasswordDesc` (パスワードの説明、変更・解除手順を含む)

### 3. スタイリング
`src/ui/styles.ts` に、説明テキスト用のCSSクラス `.comic-helper-sync-description` を追加する。
- **スタイル詳細**:
    - `font-size: 10px`
    - `color: ${COLORS.text.muted}`
    - `margin-bottom: 4px`
    - `line-height: 1.4`

## Risks / Trade-offs

- **[Risk]** テキスト量が増えることで設定画面の高さが増し、画面の小さい端末でスクロールが必要になる。
- **[Mitigation]** フォントサイズを最小限（10px）にし、`COLORS.text.muted` を用いて視覚的な圧迫感を抑える。また、モーダルの最大高さを適切に維持する。
