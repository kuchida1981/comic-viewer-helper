## REMOVED Requirements

### Requirement: ボタンの表示制御
**Reason**: 🎲 ボタンは常に表示し続ける設計に変更された。関連作品が0件・全て非公開の場合でも遷移しないだけでよい。
**Migration**: なし（ボタンの表示制御ロジックを削除すればよい）

## MODIFIED Requirements

### Requirement: 関連作品へのランダム遷移
システムは、現在表示されている作品の関連作品リストから、`isPrivate` でないものの中からランダムに1つを選択し、そのページへ遷移する機能を提供しなければならない (SHALL)。

#### Scenario: 関連作品が存在する場合の遷移
- **WHEN** ユーザーが「おすすめ（ランダム）」ボタンをクリックする
- **THEN** システムは `metadata.relatedWorks` リストから `isPrivate` でない作品のみを対象とし、その中からランダムに1つの要素を選択し、その `href` へ `window.location.href` を更新して遷移する
