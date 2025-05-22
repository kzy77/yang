// 定义卡片接口
export interface Card {
  id: number; // 唯一标识
  type: string; // 卡片类型，例如 'sheep', 'grass', 'wolf'
  layer: number; // 卡片所在的层级
  isFaceUp: boolean; // 卡片是否朝上（可点击）
  coveredBy: number[]; // 覆盖此卡片的其他卡片的ID列表
  covers: number[]; // 此卡片覆盖的其他卡片的ID列表
  initialX?: number; // 卡片的初始X位置
  initialY?: number; // 卡片的初始Y位置
  initialZ?: number; // 卡片的初始Z位置 (与layer类似，用于视觉堆叠)
  width?: number;    // 卡片宽度，用于重叠计算
  height?: number;   // 卡片高度，用于重叠计算
}

// 定义游戏状态接口
export interface GameState {
  deck: Card[]; // 牌堆中的所有卡片
  slot: Card[]; // 玩家下方的消除槽，最多7张
  eliminatedCount: number; // 已消除的卡片数量（3张一组）
  score: number; // 游戏得分
  isGameOver: boolean;
  isGameWon: boolean;
}

const MAX_SLOT_SIZE = 7;

// 卡片大致尺寸，用于重叠计算 (应与CSS中的 --card-width, --card-height 一致或按比例)
const CARD_WIDTH = 70;
const CARD_HEIGHT = 95;
const PLACEMENT_AREA_WIDTH = 350; // 游戏区域宽度估算
const PLACEMENT_AREA_HEIGHT = 300; // 游戏区域高度估算
const LAYER_OFFSET_X = 5; // 层级带来的X偏移
const LAYER_OFFSET_Y = 5; // 层级带来的Y偏移

// 检查两张卡片是否重叠
function isOverlapping(card1: Card, card2: Card): boolean {
  if (!card1.initialX || !card1.initialY || !card1.width || !card1.height ||
      !card2.initialX || !card2.initialY || !card2.width || !card2.height) {
    return false; // 位置或尺寸信息不全
  }
  // 简单的AABB (Axis-Aligned Bounding Box) 重叠检测
  return (
    card1.initialX < card2.initialX + card2.width &&
    card1.initialX + card1.width > card2.initialX &&
    card1.initialY < card2.initialY + card2.height &&
    card1.initialY + card1.height > card2.initialY
  );
}

// 初始化游戏
export function initializeGame(cardTypes: string[], cardsPerType: number, layersConfig: { layer: number, count: number }[]): GameState {
  const deck: Card[] = [];
  let idCounter = 0;

  // 1. 根据类型和数量创建基础卡片
  const baseCards: { type: string }[] = [];
  for (const type of cardTypes) {
    for (let i = 0; i < cardsPerType; i++) {
      baseCards.push({ type });
    }
  }

  // 确保卡片总数是3的倍数，方便消除
  while (baseCards.length % 3 !== 0) {
    baseCards.pop(); // 或者采取其他策略补齐
  }

  // 2. 打乱基础卡片
  for (let i = baseCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [baseCards[i], baseCards[j]] = [baseCards[j], baseCards[i]];
  }

  // 3. 根据层级配置分配卡片到牌堆
  let cardIndex = 0;
  for (const layerInfo of layersConfig) {
    for (let i = 0; i < layerInfo.count && cardIndex < baseCards.length; i++) {
      deck.push({
        id: idCounter++,
        type: baseCards[cardIndex].type,
        layer: layerInfo.layer,
        isFaceUp: false,
        coveredBy: [],
        covers: [],
        // 更无序的堆叠，同时考虑层级带来的轻微偏移
        initialX: Math.random() * (PLACEMENT_AREA_WIDTH - CARD_WIDTH) + (layerInfo.layer * LAYER_OFFSET_X),
        initialY: Math.random() * (PLACEMENT_AREA_HEIGHT - CARD_HEIGHT) + (layerInfo.layer * LAYER_OFFSET_Y),
        initialZ: layerInfo.layer,
        width: CARD_WIDTH,
        height: CARD_HEIGHT,
      });
      cardIndex++;
    }
  }
  // 如果卡片未分配完，可以考虑如何处理，例如添加到最底层或报错
  if (cardIndex < baseCards.length) {
    console.warn("Some cards were not assigned to layers due to insufficient layer capacity.");
  }

  // 4. 精确计算覆盖关系
  for (let i = 0; i < deck.length; i++) {
    for (let j = 0; j < deck.length; j++) {
      if (i === j) continue;
      const card1 = deck[i];
      const card2 = deck[j];
      // 如果 card1 在 card2 上方 (card1.layer > card2.layer) 并且它们重叠
      if (card1.layer > card2.layer && isOverlapping(card1, card2)) {
        card1.covers.push(card2.id); // card1 覆盖 card2
        card2.coveredBy.push(card1.id); // card2 被 card1 覆盖
      }
    }
  }

  // 5. 根据覆盖关系更新 isFaceUp 状态
  deck.forEach(card => {
    // 如果一张卡片没有被任何其他卡片覆盖，则它是朝上的
    card.isFaceUp = card.coveredBy.length === 0;
  });


  return {
    deck,
    slot: [],
    eliminatedCount: 0,
    score: 0, // 初始化得分
    isGameOver: false,
    isGameWon: false,
  };
}

// 点击卡片逻辑
export function clickCard(currentState: GameState, cardId: number): GameState {
  if (currentState.isGameOver || currentState.isGameWon) return currentState;

  const cardIndexInDeck = currentState.deck.findIndex(c => c.id === cardId);
  if (cardIndexInDeck === -1) return currentState; // 卡片不存在

  const cardToMove = currentState.deck[cardIndexInDeck];

  // 检查卡片是否可点击 (朝上且未被覆盖)
  if (!cardToMove.isFaceUp || cardToMove.coveredBy.length > 0) {
      // 实际游戏中，还需要检查 cardToMove 是否被其他卡片物理遮挡
      const isPhysicallyCovered = currentState.deck.some(c => 
          c.id !== cardToMove.id && 
          c.layer > cardToMove.layer &&
          // 此处应有更精确的重叠判断逻辑
          Math.abs(currentState.deck.indexOf(c) - currentState.deck.indexOf(cardToMove)) < 2 
      );
      if(isPhysicallyCovered) return currentState;
  }

  // 将卡片从牌堆移动到消除槽
  const newDeck = [...currentState.deck];
  newDeck.splice(cardIndexInDeck, 1);
  
  const newSlot = [...currentState.slot, cardToMove];

  let newEliminatedCount = currentState.eliminatedCount;
  let newScore = currentState.score;

  // 检查消除槽中是否有三张相同的卡片
  const typeCounts: { [type: string]: Card[] } = {};
  newSlot.forEach(c => {
    if (!typeCounts[c.type]) {
      typeCounts[c.type] = [];
    }
    typeCounts[c.type].push(c);
  });

  let finalSlot = [...newSlot];
  for (const type in typeCounts) {
    if (typeCounts[type].length >= 3) {
      // 找到了三张相同的卡片，进行消除
      finalSlot = finalSlot.filter(c => c.type !== type);
      const setsEliminated = Math.floor(typeCounts[type].length / 3);
      newEliminatedCount += setsEliminated;
      newScore += setsEliminated * 10; // 每消除一组得10分
      // 更新被消除卡片所覆盖的卡片的状态
      typeCounts[type].forEach(eliminatedCard => {
        eliminatedCard.covers.forEach(coveredCardId => {
          const coveredCard = newDeck.find(c => c.id === coveredCardId);
          if (coveredCard) {
            coveredCard.coveredBy = coveredCard.coveredBy.filter(id => id !== eliminatedCard.id);
            // 如果不再被任何卡片覆盖，则设置为 faceUp
            if (coveredCard.coveredBy.length === 0) {
              coveredCard.isFaceUp = true;
            }
          }
        });
      });
    }
  }

  // 当卡片从牌堆移到消除槽后，不需要在此处普遍更新isFaceUp
  // isFaceUp 的更新主要发生在被消除卡片所覆盖的卡片上 (已在上方处理)
  // 以及初始加载时。


  // 检查游戏结束条件
  let isGameOver = false;
  let isGameWon = false;

  if (finalSlot.length >= MAX_SLOT_SIZE) {
    isGameOver = true; // 消除槽满了，游戏失败
  }

  if (newDeck.length === 0 && finalSlot.length === 0) {
    isGameWon = true; // 所有卡片都消除了，游戏胜利
  }

  return {
    deck: newDeck,
    slot: finalSlot,
    eliminatedCount: newEliminatedCount,
    score: newScore,
    isGameOver,
    isGameWon,
  };
}

console.log('羊了个羊 game logic module loaded');

// 辅助函数示例 (实际游戏中需要更完善的实现)
// function isOverlapping(cardA: Card, cardB: Card): boolean {
//   // 基于卡片位置和尺寸的碰撞检测逻辑
//   return false; 
// }