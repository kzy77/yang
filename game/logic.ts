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
        initialZ: layerInfo.layer + (i / layerInfo.count) * 0.9, // More granular Z for visual stacking and coverage
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
      // If card1 is visually on top of card2 (higher initialZ) and they overlap
      if (card1.initialZ !== undefined && card2.initialZ !== undefined && card1.initialZ > card2.initialZ && isOverlapping(card1, card2)) {
        card1.covers.push(card2.id);
        card2.coveredBy.push(card1.id);
        // console.log(`DEBUG: Card ${card2.id} (layer ${card2.layer}, initialZ ${card2.initialZ?.toFixed(2)}, type ${card2.type}, X: ${card2.initialX?.toFixed(2)}, Y: ${card2.initialY?.toFixed(2)}, W: ${card2.width}, H: ${card2.height}) is covered by Card ${card1.id} (layer ${card1.layer}, initialZ ${card1.initialZ?.toFixed(2)}, type ${card1.type}, X: ${card1.initialX?.toFixed(2)}, Y: ${card1.initialY?.toFixed(2)}, W: ${card1.width}, H: ${card1.height})`);
      }
    }
  }

  // 5. 根据覆盖关系更新 isFaceUp 状态
  deck.forEach(card => {
    const previouslyFaceUp = card.isFaceUp;
    card.isFaceUp = card.coveredBy.length === 0;
    // if (previouslyFaceUp !== card.isFaceUp || !card.isFaceUp) { // Log changes or if still face down
    //   console.log(`DEBUG: Card ${card.id} (type ${card.type}, layer ${card.layer}, initialZ ${card.initialZ?.toFixed(2)}) isFaceUp: ${card.isFaceUp}. Covered by: [${card.coveredBy.join(', ')}]`);
    // }
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

// Helper function to update coverage for all cards in the deck
export function updateCardCoverage(deck: Card[]): Card[] {
  // console.log('UCC CALLED:', deck.length); // REMOVED Temporary log for benchmark debugging
  // Reset coverage for all cards
  deck.forEach(card => {
    card.covers = [];
    card.coveredBy = [];
  });

  // Recalculate coverage
  for (let i = 0; i < deck.length; i++) {
    for (let j = 0; j < deck.length; j++) {
      if (i === j) continue;
      const card1 = deck[i];
      const card2 = deck[j];
      if (card1.initialZ !== undefined && card2.initialZ !== undefined && card1.initialZ > card2.initialZ && isOverlapping(card1, card2)) {
        card1.covers.push(card2.id);
        card2.coveredBy.push(card1.id);
      }
    }
  }

  // Update isFaceUp status
  deck.forEach(card => {
    card.isFaceUp = card.coveredBy.length === 0;
  });

  return deck;
}


// 点击卡片逻辑
export function clickCard(currentState: GameState, cardId: number): GameState {
  if (currentState.isGameOver || currentState.isGameWon) return currentState;

  const cardIndexInDeck = currentState.deck.findIndex(c => c.id === cardId);
  if (cardIndexInDeck === -1) return currentState; // 卡片不存在

  const cardToMove = currentState.deck[cardIndexInDeck];

  console.log(`DEBUG: Attempting to click Card ${cardToMove.id} (type ${cardToMove.type}). Layer: ${cardToMove.layer}, InitialZ: ${cardToMove.initialZ?.toFixed(2)}. Covered by: [${cardToMove.coveredBy.join(', ')}]. Current isFaceUp: ${cardToMove.isFaceUp}`);

  // 检查卡片是否可点击 (即没有被其他卡片覆盖)
  // cardToMove.isFaceUp 的状态本身就是由 cardToMove.coveredBy.length === 0 决定的
  // 所以我们直接检查 coveredBy 即可。
  if (cardToMove.coveredBy.length > 0) {
    console.log(`DEBUG: Card ${cardToMove.id} (type ${cardToMove.type}) is considered covered. Preventing click. Details of covering cards:`);
    cardToMove.coveredBy.forEach(coveringCardId => {
      const coveringCard = currentState.deck.find(c => c.id === coveringCardId);
      if (coveringCard) {
        console.log(`  - Covering Card ID: ${coveringCard.id}, Type: ${coveringCard.type}, InitialZ: ${coveringCard.initialZ?.toFixed(2)}, X: ${coveringCard.initialX?.toFixed(2)}, Y: ${coveringCard.initialY?.toFixed(2)}, W: ${coveringCard.width}, H: ${coveringCard.height}`);
      } else {
        console.log(`  - Covering Card ID: ${coveringCardId} not found in deck (this should not happen).`);
      }
    });
    return currentState; // 卡片被遮挡，不可点击
  }
  console.log(`DEBUG: Card ${cardToMove.id} (type ${cardToMove.type}) is considered NOT covered. Proceeding with click.`);

  // 将卡片从牌堆移动到消除槽
  let newDeck = [...currentState.deck];
  newDeck.splice(cardIndexInDeck, 1);

  // Update coverage for the remaining cards in the deck
  newDeck = updateCardCoverage(newDeck);
  
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

  // 当卡片从牌堆移到消除槽后，需要更新牌堆中所有卡片的 isFaceUp 状态
  // 因为被移动的卡片可能之前覆盖了其他卡片
  newDeck.forEach(cardInDeck => {
    // 首先移除对已移动到槽中卡片的覆盖依赖
    cardInDeck.coveredBy = cardInDeck.coveredBy.filter(id => id !== cardToMove.id);
    // 如果一张卡片没有被任何其他卡片覆盖，则它是朝上的
    cardInDeck.isFaceUp = cardInDeck.coveredBy.length === 0;
  });

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