# Decision Log

This file records architectural and implementation decisions using a list format.
2025-06-02 00:10:00 - Log of updates made.

*

## Decision

*

## Rationale

*

## Implementation Details

*
---
### Decision (Code)
[2025-06-02 00:15:09] - 统一处理卡片不可点击状态的样式

**Rationale:**
为了确保所有不可点击的卡片（无论是背面朝上还是被其他卡片覆盖）都具有一致的视觉表现（例如，较低的透明度和不可点击的光标），引入了一个新的 CSS 类 `is-unclickable`。这比依赖组合类或多个条件来确定样式更清晰、更易于维护。

**Details:**
- 修改了 [`src/components/Card.tsx`](src/components/Card.tsx) 中的 `combinedClassName` 逻辑，当 `!cardData.isFaceUp || cardData.coveredBy.length > 0` 时，应用 `is-unclickable` 类。
- 在 [`src/app/globals.css`](src/app/globals.css) 中为 `.game-card.is-unclickable` 添加了样式规则，设置 `opacity: 0.6;` 和 `cursor: not-allowed;`。
- 移除了之前针对 `.card.face-down` 的特定透明度规则，以避免样式冲突，并由新的 `is-unclickable` 规则统一处理。
---
### Decision (Code)
[2025-06-02 00:22:00] - 修改不可点击卡片的视觉指示方式（从 Opacity 到 Overlay）

**Rationale:**
根据用户反馈，之前使用 `opacity` 属性降低整个卡片透明度来表示不可点击状态的方法，导致卡片上的图标内容也变得模糊不清，不符合用户要求（图案需始终可见）。因此，改用 CSS 伪元素 (`::before`) 在卡片背景上添加一个半透明的覆盖层。这种方法可以在视觉上区分不可点击的卡片，同时保持卡片核心内容（如图标）的完全可见性。

**Details:**
- 在 [`src/app/globals.css`](src/app/globals.css) 中：
    - 移除了 `.game-card.is-unclickable` 规则中的 `opacity` 属性。
    - 添加了 `.game-card.is-unclickable::before` 规则，定义了一个半透明的黑色覆盖层 (`background-color: rgba(50, 50, 50, 0.4);`)，并设置 `z-index: 1;`。
    - 为 `.game-card` 添加了 `position: relative;`。
    - 为卡片内容元素 (`.card-type-display` 和 ID `span`) 添加了样式，设置 `position: relative;` 和 `z-index: 2;`，以确保它们显示在覆盖层之上。
---
### Decision (Code)
[2025-06-02 00:29:03] - 修正不可点击卡片的视觉效果，确保图标可见并处理条纹背景

**Rationale:**
第二次用户反馈指出，不可点击卡片的图标被条纹背景遮挡。经过代码审查发现：
1. 条纹背景是由 [`src/components/responsive.css`](src/components/responsive.css) 中的 `.game-card-responsive.face-down` 规则通过 `background-image: repeating-linear-gradient(...)` 应用的。
2. 图标被同一文件中的 `.game-card-responsive:not(.is-face-up) .card-type-display` 规则使用 `clip-path` 隐藏了。
3. 之前的 `z-index` 调整可能因类名不匹配 (`game-card` vs `game-card-responsive`) 而无效。

为了满足用户“图标始终可见”的要求，同时保留 `face-down` 状态的条纹视觉提示，并为其他不可点击状态（被覆盖）提供区分：
- 移除了隐藏图标的 `clip-path` 规则。
- 确保卡片基础样式 (`.game-card-responsive`) 具有 `position: relative;`。
- 修正并确保内容元素（图标 `.card-type-display` 和 ID span）具有 `z-index: 2;`，使其显示在背景（包括条纹）之上。
- 为面朝上但被覆盖的卡片 (`.is-unclickable.is-face-up`) 单独添加了一个微妙的 `::before` 覆盖层，以区别于 `face-down` 的条纹。
- 清理了之前尝试添加的不正确的全局覆盖层。

**Details:**
- 在 [`src/components/responsive.css`](src/components/responsive.css) 中：
    - 为 `.game-card-responsive` 添加了 `position: relative;`。
    - 注释掉了 `.game-card-responsive:not(.is-face-up) .card-type-display` 的 `clip-path` 规则。
- 在 [`src/app/globals.css`](src/app/globals.css) 中：
    - 移除了之前的 `.game-card.is-unclickable::before` 规则。
    - 修改了内容元素的 `z-index` 规则，使用 `.game-card-responsive` 选择器。
    - 添加了新的 `.game-card-responsive.is-unclickable.is-face-up::before` 规则，应用 `background-color: rgba(50, 50, 50, 0.15);` 和 `z-index: 1;`。