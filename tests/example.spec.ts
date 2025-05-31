import { test, expect } from '@playwright/test';

test.beforeEach(async ({ page }) => {
  // 每次测试前导航到首页
  await page.goto('/');
});

test.describe('羊了个羊小游戏 - 初始界面测试', () => {
  test('应该正确显示游戏标题', async ({ page }) => {
    const title = page.locator('.game-title'); // 修改选择器
    await expect(title).toBeVisible();
    await expect(title).toContainText('羊了个羊'); // 增加文本内容断言
  });

  test('游戏区域应该可见', async ({ page }) => {
    const gameArea = page.locator('.game-board'); // 修改选择器
    await expect(gameArea).toBeVisible();
  });

  test('消除槽应该可见', async ({ page }) => {
    const slotArea = page.locator('.elimination-slot'); // 修改选择器
    await expect(slotArea).toBeVisible();
  });

  test('初始时不应显示游戏状态信息', async ({ page }) => { // 修改测试名称以更通用
    const messageDisplay = page.locator('.message-display'); // 修改选择器
    await expect(messageDisplay).toBeHidden(); // 初始时应隐藏或不存在
  });
});

// 后续可以添加更多测试，例如：
// - 卡片是否正确渲染
// - 点击可点击卡片是否能将其移入消除槽
// - 卡片消除逻辑是否正确
// - 游戏结束和胜利条件是否正确触发 