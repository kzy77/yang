import { initializeGame, clickCard } from '@/game/logic';
import { getLevelById } from '@/game/levels';

describe('游戏逻辑测试', () => {
  describe('initializeGame 函数', () => {
    test('应该正确初始化游戏状态', () => {
      const level = getLevelById(1);
      expect(level).not.toBeNull();
      
      if (level) {
        const gameState = initializeGame(level.cardTypes, level.cardsPerType, level.layers);
        
        // 检查初始游戏状态
        expect(gameState).toBeDefined();
        expect(gameState.deck.length).toBeGreaterThan(0);
        expect(gameState.slot).toHaveLength(0);
        expect(gameState.score).toBe(0);
        expect(gameState.isGameOver).toBe(false);
        expect(gameState.isGameWon).toBe(false);
        
        // 检查卡片是否按照层级正确设置
        const uniqueLayers = new Set(gameState.deck.map(card => card.layer));
        expect(uniqueLayers.size).toBe(level.layers);
        
        // 检查卡片类型
        const cardTypes = new Set(gameState.deck.map(card => card.type));
        expect(cardTypes.size).toBeLessThanOrEqual(level.cardTypes.length);
      }
    });
  });
  
  describe('clickCard 函数', () => {
    test('点击卡片后应该将其移到槽中', () => {
      const level = getLevelById(1);
      if (!level) return;
      
      const gameState = initializeGame(level.cardTypes, level.cardsPerType, level.layers);
      
      // 找一张顶层卡片（没有被其他卡片覆盖）
      const topCard = gameState.deck.find(card => card.coveredBy.length === 0 && card.isFaceUp);
      
      if (topCard) {
        const newState = clickCard(gameState, topCard.id);
        
        // 检查卡片是否被移到槽中
        expect(newState.slot.length).toBe(1);
        expect(newState.slot[0].id).toBe(topCard.id);
        
        // 检查得分是否增加
        expect(newState.score).toBeGreaterThan(gameState.score);
      }
    });
    
    test('槽中积累3张相同类型的卡片时应该消除', () => {
      const level = getLevelById(1);
      if (!level) return;
      
      let gameState = initializeGame(['sheep'], 3, 1); // 只有1种类型的卡片，确保能匹配
      
      // 找到3张同类型卡片
      const sheepCards = gameState.deck.filter(card => card.type === 'sheep' && card.isFaceUp).slice(0, 3);
      
      if (sheepCards.length === 3) {
        // 依次点击3张相同类型的卡片
        gameState = clickCard(gameState, sheepCards[0].id);
        gameState = clickCard(gameState, sheepCards[1].id);
        gameState = clickCard(gameState, sheepCards[2].id);
        
        // 检查槽是否为空（卡片被消除）
        expect(gameState.slot).toHaveLength(0);
        
        // 检查得分是否增加
        expect(gameState.score).toBeGreaterThan(0);
      }
    });
  });
}); 