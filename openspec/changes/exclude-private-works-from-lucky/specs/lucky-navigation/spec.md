## MODIFIED Requirements

### Requirement: 関連作品へのランダム遷移
システムは、現在表示されている作品の関連作品リストから、`isPrivate` でないものの中からランダムに1つを選択し、そのページへ遷移する機能を提供しなければならない (SHALL)。

#### Scenario: 関連作品が存在する場合の遷移
- **WHEN** ユーザーが「おすすめ（ランダム）」ボタンをクリックする
- **THEN** システムは `metadata.relatedWorks` リストから `isPrivate` でない作品のみを対象とし、その中からランダムに1つの要素を選択し、その `href` へ `window.location.href` を更新して遷移する
