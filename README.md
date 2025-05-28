# Yang Card Game

## 项目说明
这是一个基于React的卡牌游戏项目，包含以下特性：
- 动态卡牌遮挡逻辑
- 实时状态更新
- Cloudflare Pages部署支持

## 部署到Cloudflare Pages
1. 确保已安装Cloudflare CLI：`npm install -g @cloudflare/next`
2. 构建项目：`npm run build`（需确保package.json中包含正确的构建配置）
3. 部署到Cloudflare Pages：`npx cloudflare-pages deploy`