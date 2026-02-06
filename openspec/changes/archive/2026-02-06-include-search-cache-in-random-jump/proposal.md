## Why

現在、ランダムジャンプ機能（Lucky）は現在の作品に関連する作品（Related Works）のみを対象としています。
検索結果のキャッシュが利用可能な場合、それらも選択肢に含めることで、ユーザーがより多様な作品にランダムにアクセスできるようにします。

## What Changes

- `jumpToRandomWork` 関数を更新し、検索キャッシュ内の作品を選択肢に含めるように変更します。
- 検索キャッシュが1時間のTTLを過ぎていても、キャッシュが存在すれば選択対象に含めます。
- `Related Works` と `Search Results` をマージする際、URLによる重複排除を行います。
- `Related Works` については引き続き `isPrivate` フラグによるフィルタリングを維持します。

## Capabilities

### New Capabilities
- なし

### Modified Capabilities
- lucky-navigation: ランダムジャンプの対象に検索キャッシュを含めるように要件を変更。

## Impact

- `src/logic.ts`: `jumpToRandomWork` のロジック変更。
- `src/managers/UIManager.ts`: `onLucky` 呼び出し時にストアからキャッシュデータを渡すように変更。
- `src/managers/InputManager.ts`: ショートカット実行時にストアからキャッシュデータを渡すように変更。
- `src/types.ts`: `jumpToRandomWork` の引数型の変更。
