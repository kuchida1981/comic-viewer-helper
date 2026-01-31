# gui-visibility-control Specification

## Purpose
TBD - created by archiving change improve-gui-ux. Update Purpose after archive.
## Requirements
### Requirement: ホバー状態に応じた不透明度制御
GUI コンテナは、ユーザーの没入感を妨げないよう、マウスホバーの状態に応じて不透明度を動的に変更しなければならない（SHALL）。

#### Scenario: 非ホバー時の半透明化
- **WHEN** マウスカーソルが GUI コンテナの外にある時
- **THEN** GUI コンテナの不透明度が低下し（例: 0.3）、背後のコンテンツが透けて見えること

#### Scenario: ホバー時の不透明化
- **WHEN** マウスカーソルが GUI コンテナの上にある時
- **THEN** GUI コンテナが完全に不透明（1.0）になり、操作しやすい状態になること

