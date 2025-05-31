# Yang Card Game

## 项目说明
这是一个基于React的卡牌游戏项目，包含以下特性：
- 动态卡牌遮挡逻辑
- 实时状态更新
- Cloudflare Pages部署支持

## 开发

首先，克隆仓库并安装依赖：
```bash
npm install
```

然后，运行开发服务器：
```bash
npm run dev
```
打开 [http://localhost:5173](http://localhost:5173) (或Vite指定的其他端口) 查看。

## 部署到 Cloudflare Pages

您可以通过以下任一方式将此项目部署到 Cloudflare Pages：

### 方式一：通过 Git 集成 (推荐用于持续部署)

本项目可以通过 Cloudflare Pages 的 Git 集成功能轻松实现自动化部署。

1.  **登录 Cloudflare 控制台**：访问 [Cloudflare Dashboard](https://dash.cloudflare.com/)。
2.  在账户主页，选择 **Workers & Pages**。
3.  点击 **创建应用程序** > 选择 **Pages** > 点击 **连接到 Git**。
4.  **选择您的 GitHub 仓库**：选择包含此项目的 GitHub 仓库，然后点击 **开始设置**。
5.  **配置构建和部署：**
    *   **项目名称：** (例如：`yang-card-game` 或您希望的名称)
    *   **生产分支：** (例如：`main` 或您用于生产部署的分支)
    *   **框架预设：** 选择 `Vite`。
        *   Cloudflare Pages 通常会自动检测到 Vite 项目并预填以下信息，但请确认它们是正确的：
    *   **构建命令：** `npm run build`
    *   **构建输出目录：** `dist`
    *   **根目录：** (保持默认，除非您的项目在仓库的子目录中)
    *   **环境变量 (可选)：**
        *   如果您的项目依赖特定 Node.js 版本，可以在"环境变量"部分添加 `NODE_VERSION` (例如：`18` 或 `20`)。根据您的说明，约定使用最新版，Cloudflare Pages 通常会提供一个合适的较新版本，此项可根据需要设置。
        *   目前项目不需要其他特定环境变量。
6.  点击 **保存并部署**。

Cloudflare Pages 将会从您的 GitHub 仓库拉取代码，按照配置进行构建和部署。后续的推送到指定分支会自动触发新的部署。

### 方式二：通过 Wrangler CLI (手动部署)

您也可以使用 Wrangler CLI 从本地手动部署项目到 Cloudflare Pages。

1.  **安装 Wrangler CLI：**
    ```bash
    npm install -g wrangler
    ```
    *注意：之前可能是 `@cloudflare/next` 或 `cloudflare-pages-cli`，但最新的推荐是统一使用 `wrangler`。请根据您当前有效的 CLI 工具调整。如果 `npx cloudflare-pages deploy` 仍然有效，可以保留该命令。为保持通用性，这里写 `wrangler`。*

2.  **登录 Wrangler：**
    ```bash
    wrangler login
    ```

3.  **构建项目：** 确保您的项目已成功构建。
    ```bash
    npm run build
    ```

4.  **部署到 Cloudflare Pages：**
    在您的项目根目录下运行：
    ```bash
    wrangler pages deploy dist
    ```
    (或者，如果您之前的 `npx cloudflare-pages deploy dist` 命令仍然有效且是您习惯的方式，也可以在文档中保留该确切命令。`wrangler pages deploy <构建输出目录>` 是当前推荐的方式。)

    *   首次部署时，Wrangler 会引导您完成项目创建或选择现有项目。
    *   后续部署会更新到同一个项目。

### 注意事项 (通用)
*   确保您的仓库中包含 `package.json` 和 `package-lock.json` (或 `yarn.lock`) 文件。
*   如果构建失败，请检查 Cloudflare Pages 提供的构建日志 (Git集成方式) 或本地终端的输出 (CLI方式) 以获取详细错误信息。