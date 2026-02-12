## Context

現在、アプリケーションのバージョン情報は `MetadataModal` にハードコードされたインラインスタイルで表示されています。これを `HelpModal` に移動し、より適切な場所でユーザーに情報を提供できるようにします。

## Goals / Non-Goals

**Goals:**
- バージョン情報を `MetadataModal` から `HelpModal` へ移動する。
- `HelpModal` でのバージョン表示を既存のデザインと調和させる。
- 移動に伴い、不要になったコード（`MetadataModal` 内のバージョン表示ロジック）をクリーンアップする。

**Non-Goals:**
- バージョン情報の取得方法（Vite の `define` 経由）の変更。
- 新しいスタイリングシステムの導入（既存の `createElement` と `styles.ts` を継続利用する）。

## Decisions

### 1. `HelpModal` での配置
ショートカットリスト（`shortcutList`）の直後に配置します。これにより、ユーザーがショートカットを確認したついでにバージョン情報も目に入るようになります。

### 2. スタイリングの統一
`MetadataModal` で使用されていたインラインスタイルを参考にしつつ、ボーダー色などは `HelpModal` の既存スタイル（`#222`）に合わせて調整します。具体的には、`borderTop: '1px solid #333'` とし、ショートカットリストとの区切りを明確にします。

### 3. バージョン情報の表示形式
既存の形式 `${t('ui.version')}: v${__APP_VERSION__} (${__IS_UNSTABLE__ ? t('ui.unstable') : t('ui.stable')})` を維持します。

## Risks / Trade-offs

- **[Risk]** モーダルの高さが足りなくなり、スクロールが必要になる可能性がある。
  - **Mitigation**: `HelpModal` は既にスクロール可能（`overflow-y: auto`）に設定されているため、表示が崩れることはありません。また、バージョン表示は非常に小さいため、影響は軽微です。
