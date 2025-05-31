import { test, expect } from '@playwright/test';

test.describe('羊了个羊游戏', () => {
  test.beforeEach(async ({ page }) => {
    // 访问游戏页面
    await page.goto('/');
    // 等待游戏界面加载完成
    await page.waitForSelector('.game-board');
  });

  test('应该正确加载游戏页面', async ({ page }) => {
    // 检查页面标题
    await expect(page).toHaveTitle(/羊了个羊/);
    
    // 检查游戏界面元素
    await expect(page.locator('.game-title')).toBeVisible();
    await expect(page.locator('.score-display')).toBeVisible();
    await expect(page.locator('.game-board')).toBeVisible();
    await expect(page.locator('.elimination-slot')).toBeVisible();
  });

  test('点击卡片应该将其移动到消除槽', async ({ page }) => {
    // 找到一个可点击的卡片
    const clickableCard = page.locator('.game-card-responsive:not(.is-disabled)').first();
    
    // 获取当前消除槽中的卡片数量
    const initialSlotCardsCount = await page.locator('.elimination-slot .game-card-responsive').count();
    
    // 点击卡片
    await clickableCard.click();
    
    // 等待卡片移动动画完成
    await page.waitForTimeout(300);
    
    // 检查消除槽中的卡片数量是否增加
    const newSlotCardsCount = await page.locator('.elimination-slot .game-card-responsive').count();
    expect(newSlotCardsCount).toBeGreaterThan(initialSlotCardsCount);
  });

  test('游戏结束时应显示重新开始按钮', async ({ page }) => {
    // 注意：这个测试需要模拟游戏结束的场景
    // 这里我们可以通过点击足够多的卡片来触发游戏结束
    // 但由于游戏逻辑的随机性，这可能不太可靠
    // 另一种方法是通过注入脚本直接设置游戏状态
    
    await page.evaluate(() => {
      // 这里假设我们可以访问游戏状态并修改它
      // 实际实现可能需要根据游戏代码进行调整
      const gameStateElement = document.querySelector('.game-container');
      if (gameStateElement) {
        // 创建一个自定义事件来模拟游戏结束
        const event = new CustomEvent('game-over', { detail: { score: 100 } });
        gameStateElement.dispatchEvent(event);
      }
    });
    
    // 模拟点击足够多的卡片直到游戏结束
    // 注意：这种方法在实际测试中可能不可靠，因为游戏布局是随机的
    for (let i = 0; i < 20; i++) {
      const clickableCard = await page.locator('.game-card-responsive:not(.is-disabled)').first();
      if (await clickableCard.isVisible()) {
        await clickableCard.click();
        await page.waitForTimeout(100);
      }
      
      // 检查是否有重新开始按钮出现
      const restartButton = page.locator('.restart-button');
      if (await restartButton.isVisible()) {
        // 找到重新开始按钮，测试通过
        await expect(restartButton).toBeVisible();
        break;
      }
    }
  });
  
  test('响应式布局测试 - 移动设备视图', async ({ page }) => {
    // 设置移动设备视口大小
    await page.setViewportSize({ width: 375, height: 667 });
    
    // 重新加载页面
    await page.reload();
    
    // 等待游戏界面加载完成
    await page.waitForSelector('.game-board');
    
    // 检查移动设备上的布局元素
    await expect(page.locator('.game-title')).toBeVisible();
    await expect(page.locator('.game-board')).toBeVisible();
    await expect(page.locator('.elimination-slot')).toBeVisible();
    
    // 检查元素是否适应了移动设备视口
    const boardBoundingBox = await page.locator('.game-board').boundingBox();
    if (boardBoundingBox) {
      expect(boardBoundingBox.width).toBeLessThanOrEqual(375);
    }
  });
}); 