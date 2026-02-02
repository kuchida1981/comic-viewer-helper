# Spec: Resume Toggle

## REMOVED Requirements

### Requirement: レジューム機能の有効/無効状態を管理する
システムは、レジューム機能の有効/無効状態をStoreで管理しなければならない（SHALL）。

### Requirement: 設定トグルUIを提供する
システムは、GUIパネル内にレジューム機能のON/OFFを切り替えるチェックボックスを提供しなければならない（SHALL）。

### Requirement: トグル操作で状態を変更できる
システムは、チェックボックスの操作でレジューム機能の有効/無効を切り替えられなければならない（SHALL）。

### Requirement: Store状態の変更に応答する
システムは、Store.resumeEnabled の変更に応じてUIを更新しなければならない（SHALL）。

### Requirement: 無効時は保存・復元を行わない
システムは、resumeEnabled が false の場合、すべての保存・復元処理をスキップしなければならない（SHALL）。