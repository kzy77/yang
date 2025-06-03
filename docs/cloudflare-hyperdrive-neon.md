# 配置 Cloudflare Hyperdrive 连接 Neon PostgreSQL

本文档将指导您如何在 Cloudflare Pages 项目中设置和配置 Hyperdrive，以优化与 Neon PostgreSQL 数据库的连接。

## 前提条件

## 步骤

### 1. 创建 Hyperdrive 实例 (通过 Cloudflare Dashboard)

首先，您需要在 Cloudflare Dashboard 中创建一个 Hyperdrive 实例来管理数据库连接。

1.  登录您的 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2.  导航至 **Workers & Pages** > **Hyperdrive**。
3.  点击 **Create binding**。
4.  配置绑定信息：
    *   **Binding name:** 建议使用 `HYPERDRIVE`。这个名称将作为环境变量在您的 Pages Functions 中使用，与代码（例如 [`src/lib/drizzle.ts`](src/lib/drizzle.ts:0) 中的 `process.env.HYPERDRIVE`）保持一致非常重要。
    *   **Database type:** 选择 **PostgreSQL**。
    *   **Connection string:** 粘贴您的 Neon 数据库 **pooled** 连接字符串。这通常以 `postgresql://...` 开头。
        *   **极其重要:** 请**务必**使用 Neon 提供的 **pooled** 连接字符串，而不是 direct connection string。Hyperdrive 的主要优势在于连接池管理，使用 direct string 会绕过这一核心功能。
5.  点击 **Save** 保存绑定。

### 可选：使用 Wrangler CLI 创建 Hyperdrive 实例

除了通过 Dashboard UI，您也可以使用 Cloudflare 的命令行工具 Wrangler 来创建 Hyperdrive 配置。

1.  确保您已安装最新版本的 Wrangler (`npm install -g wrangler` 或 `npx wrangler@latest ...`)。
2.  运行以下命令，替换 `<NAME>` 为您想要的绑定名称（例如 `HYPERDRIVE`），并将 `postgresql://...` 替换为您的 Neon **pooled** 连接字符串：
    ```bash
    npx wrangler hyperdrive create <NAME> --connection-string="postgresql://user:password@host/dbname?sslmode=require"
    ```
    *   同样，请确保使用 **pooled** 连接字符串。

### 2. 将 Hyperdrive 绑定到 Pages 项目

创建 Hyperdrive 实例后，需要将其绑定到您的 Cloudflare Pages 项目。

1.  在 Cloudflare Dashboard 中，导航到您的 Pages 项目。
2.  进入 **Settings** > **Functions**。
3.  向下滚动到 **Hyperdrive bindings** 部分，然后点击 **Add binding**。
4.  配置绑定：
    *   **Variable name:** 输入 `HYPERDRIVE`。此名称 **必须** 与您在代码中访问环境变量时使用的名称完全匹配（例如，[`src/lib/drizzle.ts`](src/lib/drizzle.ts:0) 中的 `process.env.HYPERDRIVE`）。
    *   **Hyperdrive instance:** 从下拉列表中选择您在步骤 1 或使用 CLI 创建的 Hyperdrive 实例。
5.  点击 **Save** 保存绑定。

### 3. (可选但推荐) 设置 `DATABASE_URL` 作为备用

为了提高应用的健壮性，建议设置一个 `DATABASE_URL` 环境变量作为备用连接。这可以在 Hyperdrive 绑定遇到问题或在本地开发环境（未使用 Wrangler 或 Cloudflare Pages 平台）中提供直接连接数据库的能力。

1.  在 Pages 项目的 **Settings** > **Environment variables** 中，点击 **Add variable**（确保选择 **Production** 环境，或根据需要选择其他环境）。
2.  配置环境变量：
    *   **Variable name:** `DATABASE_URL`
    *   **Value:** 粘贴您的 Neon 数据库 **pooled** 连接字符串（与您在 Hyperdrive 配置中使用的相同）。
3.  点击 **Save**。

您的应用程序代码（如 [`src/lib/drizzle.ts`](src/lib/drizzle.ts:0)）可以实现逻辑，优先尝试使用 `process.env.HYPERDRIVE`，如果失败或未定义，则回退到使用 `process.env.DATABASE_URL`。

### 4. 重新部署 Pages 项目

完成以上配置后，您需要触发一次新的部署，以使 Hyperdrive 绑定和环境变量生效。

1.  提交您的代码更改（如果需要）。
2.  在 Cloudflare Pages 项目的部署页面，触发一次新的部署。

部署完成后，您的 Pages Functions 将通过 Hyperdrive 连接到 Neon 数据库，从而获得更优的性能和连接管理。