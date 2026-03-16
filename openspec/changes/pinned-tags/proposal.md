## Why

お気に入り画面（Library）において、特定のタグ（アーティストやジャンルなど）を頻繁に使用してフィルタリングする場合があります。これらのタグを「ピン留め」できるようにすることで、常にタグリストの先頭付近に表示させ、素早いアクセスを可能にします。

## What Changes

- タグチップ上にピン留め用のアイコンを表示し、クリックでピン留めの状態を切り替え（トグル）られるようにします。
- ピン留めされたタグは、選択状態や出現回数に関わらず、タグリストの最優先（先頭付近）に表示されるようにします。
- ピン留めの状態は `GM_storage` を通じてブラウザに保存され、ページをリロードしても保持されるようにします。

## Capabilities

### New Capabilities
- `tag-pinning`: お気に入りのタグをピン留めし、リストの先頭に優先表示する機能。

### Modified Capabilities
- `favorites-list`: タグリストのレンダリングにおいて、ピン留めされたタグを優先するソートロジックの導入。
- `gm-storage-integration`: ピン留めされたタグのリスト（`pinnedTags`）の永続化への対応。

## Impact

- `src/store.ts`: `StoreState` への `pinnedTags` の追加と永続化処理の更新。
- `src/logic.ts`: タグのソートロジックの更新。
- `src/ui/components/FavoritesModal.ts`: タグチップへのピン留めボタンの追加と UI の更新。
- `src/ui/styles.ts`: ピン留めボタンおよびピン留め状態のタグのスタイル定義。
- `src/ui/icons.ts`: ピン留めアイコン（SVG）の追加。
- `src/i18n.ts`: ピン留めに関連する文言の追加。
