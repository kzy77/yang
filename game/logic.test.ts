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
    // 模拟一个简单的堆叠场景
    const cardTypes = ['A', 'B'];
    const cardsPerType = 3;
    const layersConfig = [
      { layer: 0, count: 3 }, // Bottom layer
      { layer: 1, count: 3 }, // Top layer
    ];

    const initialState = initializeGame(cardTypes, cardsPerType, layersConfig);

    // 找到一些可能被覆盖的卡片和覆盖它们的卡片
    const bottomLayerCards = initialState.deck.filter(card => card.layer === 0);
    const topLayerCards = initialState.deck.filter(card => card.layer === 1);

    // 期望：顶层卡片应该覆盖底层卡片，且顶层卡片自身不被覆盖
    topLayerCards.forEach(topCard => {
      expect(topCard.coveredBy.length).toBe(0); // 顶层卡片不应该被覆盖
    });

    // 期望：底层卡片可能被覆盖，也可能不被覆盖，取决于具体位置
    // 至少应该有一些底层卡片被覆盖
    const someBottomCardIsCovered = bottomLayerCards.some(bottomCard => bottomCard.coveredBy.length > 0);
    expect(someBottomCardIsCovered).toBe(true);

    // 验证覆盖关系的一致性：如果 A 覆盖 B，那么 B 的 coveredBy 应该包含 A
    initialState.deck.forEach(card => {
      card.covers.forEach(coveredCardId => {
        const coveredCard = initialState.deck.find(c => c.id === coveredCardId);
        expect(coveredCard).toBeDefined();
        expect(coveredCard?.coveredBy).toContain(card.id);
      });
    });
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
    const clickableCard = gameState.deck.find(card => card.coveredBy.length === 0 && card.isFaceUp && card.type === cardType);
    if (!clickableCard) {
      // 如果没有，手动添加一张
      const newCard: Card = { id: 103, type: cardType, layer: 0, isFaceUp: true, coveredBy: [], covers: [] };
      gameState.deck.push(newCard);
// 将 clickableCard 声明为 let 而不是 const
let clickableCard = newCard;
    }

    const initialScore = gameState.score;
    const initialEliminatedCount = gameState.eliminatedCount;

    // 确保clickableCard存在再进行点击
    const newGameState = clickableCard ? clickCard(gameState, clickableCard.id) : gameState;

    expect(newGameState.slot.length).toBe(initialSlot.length); // 槽中卡片数量不变 (3张消除)
    expect(newGameState.eliminatedCount).toBe(initialEliminatedCount + 3);
    expect(newGameState.score).toBe(initialScore + 100); // 假设消除3张卡片得100分
    expect(newGameState.slot).not.toContainEqual(expect.objectContaining({ type: cardType })); // 相同类型的卡片被消除
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
    // 模拟所有卡片都被消除的情况
    // 模拟所有卡片都被消除的情况
    // 假设总共有 9 张卡片，需要消除 3 组
    const totalCards = 9;
    gameState.deck = []; // 牌堆为空
    gameState.slot = []; // 槽为空
    gameState.eliminatedCount = totalCards - 3; // 模拟已消除 totalCards - 3 张卡片

    // 添加最后3张可消除的卡片到牌堆
    const cardType = 'X';
    const card1: Card = { id: 401, type: cardType, layer: 0, isFaceUp: true, coveredBy: [], covers: [] };
    const card2: Card = { id: 402, type: cardType, layer: 0, isFaceUp: true, coveredBy: [], covers: [] };
    const card3: Card = { id: 403, type: cardType, layer: 0, isFaceUp: true, coveredBy: [], covers: [] };
    gameState.deck.push(card1, card2, card3);

    // 将这三张卡片添加到槽中，模拟匹配消除
    let tempState = { ...gameState, slot: [...gameState.slot, card1] };
    tempState = clickCard(tempState, card1.id); // 将 card1 放入槽

    tempState = { ...tempState, slot: [...tempState.slot, card2] };
    tempState = clickCard(tempState, card2.id); // 将 card2 放入槽

    tempState = { ...tempState, slot: [...tempState.slot, card3] };
    const finalState = clickCard(tempState, card3.id); // 将 card3 放入槽，触发消除和胜利

    expect(finalState.isGameWon).toBe(true);
    expect(finalState.deck.length).toBe(0);
    expect(finalState.slot.length).toBe(0);
    expect(finalState.eliminatedCount).toBe(totalCards); // 所有卡片都被消除
  });
});