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
---
### Decision (Code)
[2025-06-02 00:39:06] - 调整 Face-Down 卡片的背景和条纹颜色

**Rationale:**
用户反馈指出，之前 `face-down` 卡片的深色条纹背景（`#282c34`）视觉上过暗。为了满足用户希望颜色变浅但仍与可点击卡片（白色背景）形成对比的要求，对样式进行了调整。

**Details:**
- 在 [`src/components/responsive.css`](src/components/responsive.css) 的 `.game-card-responsive.face-down` 规则中：
    - 将 `background-color` 从 `var(--secondary-color)` 修改为 `#cccccc` (中灰色)。
    - 将 `background-image` 中的条纹颜色从 `rgba(255,255,255,0.05)` 修改为 `rgba(0,0,0,0.08)`，并调整了条纹大小，使其在新的灰色背景上更协调。
    - 调整了 `color` 属性为 `#555555` 以确保文本/图标在灰色背景上的可读性。
---
### Decision (Code)
[2025-06-02 00:57:45] - 实现排名功能的前端展示

**Rationale:**
根据用户要求，在游戏界面右侧展示 Top 10 排名。选择在主要的 `GameInterface` 组件中实现此功能，因为它管理着整体游戏状态和布局。使用标准的 React `useState` 和 `useEffect` hooks 来管理排名数据的获取和状态。采用 Flexbox 布局将游戏区域和排名区域并排显示，并添加了响应式处理，在较小屏幕上垂直堆叠。

**Details:**
- 在 [`src/components/GameInterface.tsx`](src/components/GameInterface.tsx) 中：
    - 添加了 `rankingData`, `rankingLoading`, `rankingError` 状态。
    - 添加了 `useEffect` hook，在组件挂载时调用 `/api/ranking` 获取数据。
    - 修改了 JSX，添加了 `.main-layout-container` (Flexbox) 和 `.ranking-container`。
    - 在 `.ranking-container` 中渲染排名列表，包含加载和错误状态处理。
- 在 [`src/app/globals.css`](src/app/globals.css) 中：
    - 添加了 `.main-layout-container`, `.ranking-container`, `.ranking-list`, `.ranking-item` 等 CSS 规则，定义了布局（右侧边栏）、宽度、内边距、边框和列表项样式。
    - 添加了媒体查询，在小屏幕上将布局改为垂直堆叠。
---
### Decision (Code)
[2025-06-02 01:04:24] - 改进环境变量处理说明和 SQL 脚本交付方式

**Rationale:**
根据用户反馈，为了提高清晰度和易用性：
1.  环境变量（如 `DATABASE_URL`）的需求应直接在代码中通过注释明确说明，并建议使用 `.env.local` 文件进行本地配置。
2.  数据库 DDL 脚本应提供为单独的 `.sql` 文件，而不是嵌入在聊天文本中，以便于用户直接执行。

**Details:**
- 修改了 [`src/app/api/ranking/route.ts`](src/app/api/ranking/route.ts)，添加了详细注释，解释 `DATABASE_URL` 的必要性以及如何在 `.env.local` 中设置。
- 创建了 [`sql/schema.sql`](sql/schema.sql) 文件，包含了 `CREATE TABLE game_results` 和 `CREATE INDEX idx_ranking` 的 SQL 语句，并添加了执行说明。
---
### Decision (Code)
[2025-06-02 01:34:09] - 确定用户标识符方案为“简单昵称输入”

**Rationale:**
在讨论了使用 IP 地址（因隐私和技术问题被否定）或其他标识符后，根据用户选择，决定采用最简单的方案：在游戏结束时允许玩家输入昵称，并将其存储在 `game_results` 表的 `username` 列中。接受可能存在的昵称重复。此方案下，现有的数据库表结构和排名查询逻辑无需修改。

**Details:**
- 保持 [`sql/schema.sql`](sql/schema.sql) 中 `game_results` 表的 `username VARCHAR(255) NOT NULL` 定义。
- 后续需要实现前端输入昵称和后端保存昵称及得分的功能。
---
### Decision (Architecture/Code)
[2025-06-02 01:50:23] - 批准在 `GameInterface.tsx` 中刷新排名的方案

**Rationale:**
该方案（在 `handleRestartGame` 和分数提交成功后调用 `fetchRanking`）与该组件现有的数据获取模式（直接 API 调用，如 `useEffect` 中获取初始排名）一致，且符合 [`memory-bank/decisionLog.md:81`](memory-bank/decisionLog.md:81) 的记录。它直接满足了刷新排名的需求，且避免了引入不必要的复杂性（如全局状态管理），因为 [`memory-bank/systemPatterns.md`](memory-bank/systemPatterns.md) 中未定义此类模式。

**Implementation Details:**
- **建议:**
    1.  在 [`src/components/GameInterface.tsx`](src/components/GameInterface.tsx) 中创建可复用的 `async` 函数 `fetchRankingData`，封装 API 调用 (`/api/ranking`) 及状态更新 (`rankingData`, `rankingLoading`, `rankingError`)。
    2.  在 `useEffect` (mount 时)、`handleRestartGame` (调用 `startGame` 后) 以及分数提交成功后调用 `fetchRankingData`。
    3.  确保妥善处理加载和错误状态。