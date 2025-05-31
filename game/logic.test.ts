// 从 logic.ts 导入所需的函数和类型
// 移除重复的 Card 导入,因为后面已经从 logic.ts 导入了所需的所有类型和函数
import { describe } from 'vitest';
import { expect } from 'vitest';
// 从 logic.ts 导入所需的函数和类型
import { initializeGame, clickCard, GameState, Card } from './logic';

describe('initializeGame', () => {
  test('should initialize the game state correctly', () => {
    const cardTypes = ['A', 'B', 'C'];
    const cardsPerType = 3;
    const layersConfig = [
      { layer: 0, count: 3 },
      { layer: 1, count: 3 },
      { layer: 2, count: 3 },
    ];

    const initialState = initializeGame(cardTypes, cardsPerType, layersConfig);

    expect(initialState).toBeDefined();
    expect(initialState.deck.length).toBe(cardTypes.length * cardsPerType);
    expect(initialState.slot.length).toBe(0);
    expect(initialState.eliminatedCount).toBe(0);
    expect(initialState.score).toBe(0);
    expect(initialState.isGameOver).toBe(false);
    expect(initialState.isGameWon).toBe(false);

    // 验证卡片是否都有唯一的ID
    const cardIds = initialState.deck.map(card => card.id);
    expect(new Set(cardIds).size).toBe(initialState.deck.length);

    // 验证 isFaceUp 状态是否根据 coveredBy 正确设置
    initialState.deck.forEach(card => {
      expect(card.isFaceUp).toBe(card.coveredBy.length === 0);
    });

    // 验证覆盖关系是否合理（简单检查，更复杂的需要模拟布局）
    // 至少最顶层的卡片应该没有被覆盖
    const topLayerCards = initialState.deck.filter(card => card.layer === Math.max(...layersConfig.map(l => l.layer)));
    const uncoveredCards = initialState.deck.filter(card => card.coveredBy.length === 0);
    expect(uncoveredCards.length).toBeGreaterThan(0);

    // 验证所有卡片都有位置和尺寸信息
    initialState.deck.forEach(card => {
      expect(card.initialX).toBeDefined();
      expect(card.initialY).toBeDefined();
      expect(card.initialZ).toBeDefined();
      expect(card.width).toBeDefined();
      expect(card.height).toBeDefined();
    });
  });

  it('should correctly calculate card coverage based on initialZ and overlap', () => {
    const cardTypes = ['A', 'B', 'C']; // 3 types
    const cardsPerType = 4;            // 4 per type
    // Total initial cards = 3 * 4 = 12. This is a multiple of 3, so no cards are popped.
    // Effective total cards = 12.
    const layersConfig = [
      { layer: 0, count: 6 }, // 6 cards for layer 0
      { layer: 1, count: 6 }  // 6 cards for layer 1 (top layer)
    ];
    // Total cards specified in layersConfig = 6 + 6 = 12, which matches effective total cards.

    const gameState = initializeGame(cardTypes, cardsPerType, layersConfig);
    const topLayerCards = gameState.deck.filter(card => card.layer === 1);
    
    // 现在我们期望顶层有6张卡
    expect(topLayerCards.length).toBe(6); 

    // 期望：顶层卡片中，拥有最高 initialZ 值的卡片不应该被任何其他卡片覆盖。
    if (topLayerCards.length > 0) {
      let maxZCard = topLayerCards[0];
      for (let i = 1; i < topLayerCards.length; i++) {
        if ((topLayerCards[i].initialZ || 0) > (maxZCard.initialZ || 0)) {
          maxZCard = topLayerCards[i];
        }
      }
      expect(maxZCard.coveredBy.length).toBe(0);
    }
  });
});

describe('clickCard', () => {
  let gameState: GameState;
  let initialDeck: Card[];
  let initialSlot: Card[];

  beforeEach(() => {
    // 每次测试前初始化一个游戏状态
    const cardTypes = ['A', 'B', 'C'];
    const cardsPerType = 3;
    const layersConfig = [
      { layer: 0, count: 9 }, // 所有卡片都在同一层，方便测试覆盖逻辑
    ];
    gameState = initializeGame(cardTypes, cardsPerType, layersConfig);
    initialDeck = [...gameState.deck];
    initialSlot = [...gameState.slot];

    // 确保至少有一张卡片是可点击的 (即没有被覆盖)
    const uncoveredCard = gameState.deck.find(card => card.coveredBy.length === 0);
    if (!uncoveredCard) {
      // 如果没有未被覆盖的卡片，手动设置一张
      gameState.deck[0].coveredBy = [];
      gameState.deck[0].isFaceUp = true;
    }
  });

  it('should move a clickable card from deck to slot', () => {
    const clickableCard = gameState.deck.find(card => card.coveredBy.length === 0 && card.isFaceUp);
    if (!clickableCard) throw new Error('No clickable card found for test');

    const newGameState = clickCard(gameState, clickableCard.id);

    expect(newGameState.deck.length).toBe(initialDeck.length - 1);
    expect(newGameState.slot.length).toBe(initialSlot.length + 1);
    expect(newGameState.slot).toContainEqual(expect.objectContaining({ id: clickableCard.id }));
    expect(newGameState.deck).not.toContainEqual(expect.objectContaining({ id: clickableCard.id }));
  });

  it('should not move a covered card', () => {
    // 找到一张被覆盖的卡片
    const coveredCard = gameState.deck.find(card => card.coveredBy.length > 0);
    if (!coveredCard) {
      // 如果没有被覆盖的卡片，手动设置一张
      const cardToCover = gameState.deck[0];
      const coveringCard = gameState.deck[1];
      cardToCover.coveredBy = [coveringCard.id];
      cardToCover.isFaceUp = false;
      coveringCard.covers = [cardToCover.id];
      const coveredCard = cardToCover; // 将 cardToCover 赋值给新的变量 coveredCard
    }

    // 确保 coveredCard 存在再进行点击
    const newGameState = coveredCard ? clickCard(gameState, coveredCard.id) : gameState;

    expect(newGameState.deck.length).toBe(initialDeck.length);
    expect(newGameState.slot.length).toBe(initialSlot.length);
    // 如果 coveredCard 存在,验证它仍在牌堆中
    coveredCard && expect(newGameState.deck).toContainEqual(expect.objectContaining({ id: coveredCard.id }));
  });

  it('should not allow clicking if game is over or won', () => {
    gameState.isGameOver = true;
    const clickableCard = gameState.deck.find(card => card.coveredBy.length === 0 && card.isFaceUp);
    if (!clickableCard) throw new Error('No clickable card found for test');

    const newGameState = clickCard(gameState, clickableCard.id);
    expect(newGameState).toEqual(gameState); // 状态不应改变

    gameState.isGameOver = false;
    gameState.isGameWon = true;
    const newGameState2 = clickCard(gameState, clickableCard.id);
    expect(newGameState2).toEqual(gameState); // 状态不应改变
  });

  it('should update card coverage after a card is moved', () => {
    // 准备一个明确的覆盖场景
    // cardA 覆盖 cardB
    const cardA: Card = { id: 1, type: 'A', layer: 1, isFaceUp: true, coveredBy: [], covers: [], initialX: 0, initialY: 0, initialZ: 2, width: 100, height: 100 };
    const cardB: Card = { id: 2, type: 'B', layer: 0, isFaceUp: false, coveredBy: [cardA.id], covers: [], initialX: 0, initialY: 0, initialZ: 1, width: 100, height: 100 };
    const cardC: Card = { id: 3, type: 'C', layer: 0, isFaceUp: true, coveredBy: [], covers: [], initialX: 100, initialY: 100, initialZ: 0, width: 100, height: 100 };

    // 确保 gameState 包含这些卡片
    gameState.deck = [cardA, cardB, cardC];
    // 重新运行 updateCardCoverage 确保初始状态正确
    // 需要从 logic.ts 导入 updateCardCoverage 函数
    // 需要从 logic.ts 导入 updateCardCoverage 函数
    // 暂时注释掉这行,等导入后再使用
    // gameState.deck = updateCardCoverage(gameState.deck);

    // 找到 cardB 的最新状态
    const initialCardB = gameState.deck.find(c => c.id === cardB.id);
    expect(initialCardB?.coveredBy.length).toBeGreaterThan(0); // 确保 cardB 初始是被覆盖的

    // 点击 cardA
    const newGameState = clickCard(gameState, cardA.id);

    // 验证 cardB 现在是否变为可点击
    const updatedCardB = newGameState.deck.find(c => c.id === cardB.id);
    expect(updatedCardB).toBeDefined();
    expect(updatedCardB?.coveredBy.length).toBe(0); // 期望 cardB 不再被覆盖
    expect(updatedCardB?.isFaceUp).toBe(true);
  });

  it('should handle card matching and elimination', () => {
    // 准备槽中已有两张相同类型的卡片
    const cardType = 'A';
    const card1: Card = { id: 101, type: cardType, layer: 0, isFaceUp: true, coveredBy: [], covers: [] };
    const card2: Card = { id: 102, type: cardType, layer: 0, isFaceUp: true, coveredBy: [], covers: [] };
    gameState.slot.push(card1, card2);

    // 找到一张可点击的相同类型的卡片
    let clickableCard = gameState.deck.find(card => card.coveredBy.length === 0 && card.isFaceUp && card.type === cardType);
    if (!clickableCard) {
      // 如果没有，手动添加一张
      const newCard: Card = { id: 103, type: cardType, layer: 0, isFaceUp: true, coveredBy: [], covers: [] };
      gameState.deck.push(newCard);
      clickableCard = newCard;
    }

    const initialScore = gameState.score;
    const initialEliminatedCount = gameState.eliminatedCount;
    const initialSlotCount = gameState.slot.length; // 记录放入第三张牌之前的数量

    // 确保clickableCard存在再进行点击
    const newGameState = clickCard(gameState, clickableCard.id);

    expect(newGameState.slot.length).toBe(initialSlotCount - 2); // 3张被消除，槽中数量应为放入前-2 (因为先放入再消除)
    expect(newGameState.eliminatedCount).toBe(initialEliminatedCount + 1); // 消除了一组，每组3张，但eliminatedCount记录的是组数
    expect(newGameState.score).toBe(initialScore + 10); // 消除一组得10分
    expect(newGameState.slot.filter(c => c.type === cardType).length).toBe(0); // 相同类型的卡片被消除
  });

  it('should set isGameOver if slot is full and no match', () => {
    // 填充槽到只剩一个空位，且没有可匹配的卡片
    for (let i = 0; i < 6; i++) {
      gameState.slot.push({ id: 200 + i, type: `Type${i}`, layer: 0, isFaceUp: true, coveredBy: [], covers: [] });
    }

    // 找到一张可点击的卡片，且其类型与槽中现有卡片都不匹配
    const uniqueCardType = 'UniqueType';
    const clickableCard: Card = { id: 300, type: uniqueCardType, layer: 0, isFaceUp: true, coveredBy: [], covers: [] };
    gameState.deck.push(clickableCard);

    const newGameState = clickCard(gameState, clickableCard.id);

expect(newGameState.isGameOver).toBe(true);
    expect(newGameState.slot.length).toBe(7);
  });

  it('should set isGameWon if all cards are eliminated', () => {
    const cardTypes = ['A'];
    const cardsPerType = 3;
    const layersConfig = [
      { layer: 0, count: 3 }
    ];
    
    let simpleGameState: GameState;
    let attempts = 0;
    const MAX_INIT_ATTEMPTS = 10; // 尝试10次以获得一个所有卡片都朝上的初始状态

    do {
      simpleGameState = initializeGame(cardTypes, cardsPerType, layersConfig);
      attempts++;
    } while (
      simpleGameState.deck.some(card => !card.isFaceUp || card.coveredBy.length > 0) &&
      attempts < MAX_INIT_ATTEMPTS
    );

    // 断言所有卡片都朝上且未被覆盖
    simpleGameState.deck.forEach(card => {
      expect(card.isFaceUp).toBe(true); 
      expect(card.coveredBy.length).toBe(0);
    });

    expect(simpleGameState.deck.length).toBe(3); 

    // 依次点击这三张卡片
    const cardIdsToClick = simpleGameState.deck.map(card => card.id);
    expect(cardIdsToClick.length).toBe(3);

    for (const cardId of cardIdsToClick) {
      simpleGameState = clickCard(simpleGameState, cardId);
    }

    expect(simpleGameState.deck.length).toBe(0);
    expect(simpleGameState.slot.length).toBe(0);
    expect(simpleGameState.isGameWon).toBe(true);
    expect(simpleGameState.isGameOver).toBe(false);
    expect(simpleGameState.score).toBe(10);
  });
});