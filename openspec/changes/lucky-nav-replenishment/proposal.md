## Why

現在の「おすすめ（ランダム）」機能（Lucky Navigation）は、候補が「現在のページの関連作品」や「直近の検索キャッシュ」に限定されているため、マイナーな作品からの遷移で候補がすぐに枯渇したり、同じ作品が繰り返されたりする課題があります。
本変更では、候補が少ない場合に能動的に検索結果の次ページやタグから作品を補充する仕組みを導入し、探索の多様性とユーザー体験を向上させます。

## What Changes

- **DiscoveryManager の導入**: 候補の選出、補充、および非同期ジャンプのロジックを管理する新しいマネージャーを追加します。
- **能動的補充ロジックの実装**:
    - **Deep Fetch**: 検索キャッシュの候補が少ない場合、自動的に「次のページ」を fetch して補充します。
    - **タグベースの補充**: 候補が不足している場合、現在の作品のタグからランダムに1つを選択し、そのタグの検索結果をバックグラウンドで取得します。
- **UI/UX の改善**:
    - 🎲 ボタンのクリックから遷移までの間、ローディング状態を表示するようにします（`isLuckyLoading` 状態の追加）。
    - ショートカットキーからの発火時も、補充ロジックを経由するように統一します。
- **ロジックの整理**: `UIManager` や `InputManager` に散らばっている検索・抽選ロジックを `DiscoveryManager` に集約します。

## Capabilities

### New Capabilities
- `discovery-management`: 候補プールの監視、非同期での補充（Deep Fetch/タグ検索）、および抽選プロセスの管理。

### Modified Capabilities
- `lucky-navigation`: 候補が少ない場合の能動的補充要件、および非同期抽選中の UI フィードバック要件を追加。

## Impact

- `src/store.ts`: `isLuckyLoading` 状態の追加。
- `src/logic.ts`: 候補数の判定やフィルタリングロジックの調整。
- `src/managers/UIManager.ts`: 検索・抽選ロジックの `DiscoveryManager` への委譲、UI コンポーネントへのローディング状態の反映。
- `src/managers/InputManager.ts`: ランダムジャンプ実行時の `DiscoveryManager` 利用。
- `src/ui/components/NavigationButtons.ts`: 🎲 ボタンのローディング表示対応。
