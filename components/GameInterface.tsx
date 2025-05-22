// components/GameInterface.tsx
import React, { useState, useEffect, CSSProperties } from 'react';
import './animations.css'; // Import a new CSS file for animations
import './responsive.css'; // Import responsive CSS
import { initializeGame, clickCard, GameState, Card as GameCard } from '../game/logic';
import { getLevelById, Level } from '../game/levels';

// 基础卡片样式相关的定义已移至 responsive.css
// const baseCardStyle: React.CSSProperties = { ... }; // Kept for reference, but not used directly for empty slots anymore.

// slotContainerStyle 已移至 responsive.css as .slot-container
// const slotContainerStyle: React.CSSProperties = { ... };

// slotStyle 已移至 responsive.css as .elimination-slot
// const slotStyle: React.CSSProperties = { ... };

// gameBoardContainerStyle 已移至 responsive.css as .game-board-container
// const gameBoardContainerStyle: React.CSSProperties = { ... };

// gameBoardStyle 已移至 responsive.css as .game-board
// const gameBoardStyle: React.CSSProperties = { ... };

import CardComponent from './Card'; // Import the Card component

const GameInterface: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    // 加载第一关作为示例
    const levelData = getLevelById(1);
    if (levelData) {
      setCurrentLevel(levelData);
      setGameState(initializeGame(levelData.cardTypes, levelData.cardsPerType, levelData.layers));
    } else {
      setMessage('无法加载关卡数据！');
    }
  }, []);

  const handleCardClick = (cardId: number) => {
    if (gameState && !gameState.isGameOver && !gameState.isGameWon) {
      const newState = clickCard(gameState, cardId);
      setGameState(newState);

      if (newState.isGameWon) {
        setMessage(`恭喜！你赢了！得分: ${newState.score}`);
      } else if (newState.isGameOver) {
        setMessage(`游戏结束！槽满了。得分: ${newState.score}`);
      }
    }
  };

  if (!gameState || !currentLevel) {
    return <div>{message || '正在加载游戏...'}</div>;
  }

  // 渲染牌堆中的卡片
  const renderDeckCard = (card: GameCard) => {
    // Use initialX and initialY if available, otherwise fallback to index-based positioning
    const leftPosition = card.initialX !== undefined ? card.initialX : (gameState?.deck.indexOf(card) ?? 0 % 10) * 30 + (card.layer * 5);
    const topPosition = card.initialY !== undefined ? card.initialY : Math.floor((gameState?.deck.indexOf(card) ?? 0) / 10) * 40 + (card.layer * 5);

    const cardPositionStyle: CSSProperties = {
      position: 'absolute',
      left: `${leftPosition}px`,
      top: `${topPosition}px`,
      zIndex: card.initialZ !== undefined ? card.initialZ : card.layer, // Use initialZ for z-index
    };

    return (
      <CardComponent
        key={`deck-${card.id}`}
        cardData={card}
        onClick={handleCardClick}
        style={cardPositionStyle} // Pass down position style
        className={`game-card-responsive ${!card.isFaceUp || card.coveredBy.length > 0 ? 'is-disabled' : ''}`.trim()}
      />
    );
  };

  // 渲染消除槽中的卡片
  const renderSlotCard = (card: GameCard) => {
    return (
      <CardComponent
        key={`slot-${card.id}`}
        cardData={{...card, isFaceUp: true}} // Cards in slot are always face up
        onClick={() => {}} // Cards in slot are not clickable to move again
        className={`game-card-responsive ${message.includes(card.type) && message.includes('消除') ? 'card-matched-animation' : ''}`.trim()}
      />
    );
  };

  return (
    <div className="game-container">
      <h1 className="game-title">羊了个羊 (关卡: {currentLevel.name})</h1>
      <p className="score-display">得分: {gameState.score}</p>
      {message && <p className="message-display" style={{ color: gameState.isGameWon ? 'green' : 'red' }}>{message}</p>}
      
      <div className="game-board-container">
        <div className="game-board">
          {gameState.deck.map((card) => renderDeckCard(card))}
        </div>
      </div>

      <h2 className="slot-area-title">消除槽</h2>
      <div className="slot-container">
        <div className="elimination-slot">
          {gameState.slot.map(card => renderSlotCard(card))}
          {Array(Math.max(0, 7 - gameState.slot.length)).fill(null).map((_, i) => (
              <div key={`empty-${i}`} className="empty-slot-placeholder"></div>
          ))}
        </div>
      </div>

      {(gameState.isGameOver || gameState.isGameWon) && (
        <button className="restart-button" onClick={() => {
          const levelData = getLevelById(currentLevel.id); // 重新加载当前关卡
          if (levelData) {
            setGameState(initializeGame(levelData.cardTypes, levelData.cardsPerType, levelData.layers));
            setMessage('');
          }
        }}>重新开始</button>
      )}
    </div>
  );
};

export default GameInterface;