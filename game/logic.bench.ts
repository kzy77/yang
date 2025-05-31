import { bench, describe } from 'vitest';
import { initializeGame, updateCardCoverage, Card } from './logic';

describe('initializeGame benchmark', () => {
  const cardTypes = ['A', 'B', 'C', 'D', 'E'];
  const cardsPerTypeSmall = 6; //  Total initial: 5*6=30. Effective: 30.
  const cardsPerTypeMedium = 12; // Total initial: 5*12=60. Effective: 60.
  const cardsPerTypeLarge = 30; // Total initial: 5*30=150. Effective: 150.

  const layersConfigSimple = [
    { layer: 0, count: 15 },
    { layer: 1, count: 15 },
  ]; // For 30 cards

  const layersConfigMedium = [
    { layer: 0, count: 20 },
    { layer: 1, count: 20 },
    { layer: 2, count: 20 },
  ]; // For 60 cards

  const layersConfigComplex = [
    { layer: 0, count: 30 },
    { layer: 1, count: 30 },
    { layer: 2, count: 30 },
    { layer: 3, count: 30 },
    { layer: 4, count: 30 },
  ]; // For 150 cards

  bench('small deck, simple layers (30 cards, 2 layers)', () => {
    initializeGame(cardTypes, cardsPerTypeSmall, layersConfigSimple);
  });

  bench('medium deck, medium layers (60 cards, 3 layers)', () => {
    initializeGame(cardTypes, cardsPerTypeMedium, layersConfigMedium);
  });

  bench('large deck, complex layers (150 cards, 5 layers)', () => {
    initializeGame(cardTypes, cardsPerTypeLarge, layersConfigComplex);
  });

  // 测试更多卡片类型，但总卡片数与上面类似，看类型数量影响
  const manyCardTypes = Array.from({ length: 15 }, (_, i) => `T${i}`); // 15 types
  const cardsPerTypeFew = 4; // Total initial: 15*4 = 60. Effective: 60.
  bench('many types, medium deck (60 cards, 15 types, 3 layers)', () => {
    initializeGame(manyCardTypes, cardsPerTypeFew, layersConfigMedium);
  });

});

describe('updateCardCoverage benchmark', () => {
  const createDeck = (numCards: number, numLayers: number): Card[] => {
    const deck: Card[] = [];
    const cardTypes = ['A', 'B', 'C', 'D', 'E'];
    const cardsPerType = Math.ceil(numCards / cardTypes.length);
    let idCounter = 0;

    const baseCards: { type: string }[] = [];
    for (const type of cardTypes) {
      for (let i = 0; i < cardsPerType && baseCards.length < numCards; i++) {
        baseCards.push({ type });
      }
    }
    // Ensure exact number of cards if numCards is not a multiple of cardTypes.length * cardsPerType
    while(baseCards.length > numCards) baseCards.pop();
    while(baseCards.length < numCards) baseCards.push({type: cardTypes[0]}); // Fill up if needed

    // Distribute cards into layers roughly
    const cardsPerLayer = Math.ceil(numCards / numLayers);
    for (let l = 0; l < numLayers; l++) {
      for (let i = 0; i < cardsPerLayer && idCounter < numCards; i++) {
        const cardIndexInBase = l * cardsPerLayer + i;
        if (cardIndexInBase >= numCards) break;
        deck.push({
          id: idCounter++,
          type: baseCards[cardIndexInBase % baseCards.length].type, // modulo to be safe
          layer: l,
          isFaceUp: false, // Will be updated by updateCardCoverage
          coveredBy: [],
          covers: [],
          initialX: Math.random() * 300,
          initialY: Math.random() * 250,
          initialZ: l + Math.random() * 0.9, // Simplified Z for benchmark
          width: 70,
          height: 95,
        });
      }
    }
    return deck;
  };

  const smallDeck = createDeck(30, 2);
  const mediumDeck = createDeck(60, 3);
  const largeDeck = createDeck(150, 5);

  bench('updateCardCoverage on small deck (30 cards)', () => {
    // Clone deck to avoid in-place modification affecting subsequent runs in the same bench iteration
    const currentDeck = smallDeck.map(card => ({ ...card, coveredBy: [], covers: [] }));
    updateCardCoverage(currentDeck);
  });

  bench('updateCardCoverage on medium deck (60 cards)', () => {
    const currentDeck = mediumDeck.map(card => ({ ...card, coveredBy: [], covers: [] }));
    updateCardCoverage(currentDeck);
  });

  bench('updateCardCoverage on large deck (150 cards)', () => {
    const currentDeck = largeDeck.map(card => ({ ...card, coveredBy: [], covers: [] }));
    updateCardCoverage(currentDeck);
  });
});

// 可以在此文件继续添加其他函数的 benchmark，例如 updateCardCoverage 