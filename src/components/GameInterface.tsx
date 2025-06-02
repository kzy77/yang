// components/GameInterface.tsx
import React, { useState, useEffect, CSSProperties, useRef, useCallback } from 'react'; // Added useRef, useCallback
import './animations.css';
import './responsive.css';
import { initializeGame, clickCard, GameState, Card as GameCard } from '@/game/logic';
import { getLevelById, Level } from '@/game/levels';
import CardComponent from './Card';

interface RankingItem {
  rank: number;
  username: string;
  score: number;
  time: number;
}

// Define possible view states
type GameView = 'enter_name' | 'playing' | 'game_over';

const GameInterface: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [message, setMessage] = useState<string>('');
  // --- New State ---
  const [gameView, setGameView] = useState<GameView>('enter_name'); // Start with name entry
  const [username, setUsername] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null); // For timing
  const [finalTimeMs, setFinalTimeMs] = useState<number | null>(null); // Store final time
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false); // Submission loading state
  const [submitMessage, setSubmitMessage] = useState<string>(''); // Submission success/error message
  // --- Ranking State ---
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [rankingLoading, setRankingLoading] = useState<boolean>(true);
  const [rankingError, setRankingError] = useState<string | null>(null);
  // Ref for username input
  const usernameInputRef = useRef<HTMLInputElement>(null);

  // --- Reusable Fetch Ranking Data Function ---
  const fetchRankingData = useCallback(async () => {
    setRankingLoading(true);
    setRankingError(null);
    console.log("Fetching ranking data..."); // Added for debugging
    try {
      const response = await fetch('/api/ranking');
      if (!response.ok) {
        let errorDetails = 'Failed to fetch ranking';
        try { const errorData = await response.json(); errorDetails = errorData.error || errorData.details || errorDetails; } catch {} {}
        throw new Error(`${response.status}: ${errorDetails}`);
      }
      const data: RankingItem[] = await response.json();
      setRankingData(data);
      console.log("Ranking data fetched successfully:", data); // Added for debugging
    } catch (error) {
      console.error("Failed to fetch ranking:", error);
      setRankingError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setRankingLoading(false);
    }
  }, []); // Empty dependency array as it doesn't depend on component state/props directly

  // --- Fetch Initial Ranking Data on Mount ---
  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]); // Depend on the memoized fetchRankingData function

  // --- Game Initialization (triggered after username entry or restart) ---
  const startGame = useCallback(() => {
    if (username.trim() === '') {
        setMessage('请输入用户名！'); // Show message if username is empty
        usernameInputRef.current?.focus(); // Focus the input
        return;
    }
    const levelData = getLevelById(1); // Load level 1
    if (levelData) {
      setCurrentLevel(levelData);
      const initialGs = initializeGame(levelData.cardTypes, levelData.cardsPerType, levelData.layers);
      setGameState(initialGs);
      setMessage(''); // Clear previous messages
      setSubmitMessage(''); // Clear submit message
      setFinalTimeMs(null); // Reset final time
      setStartTime(Date.now()); // Start timer
      setGameView('playing'); // Change view to playing
      // Fetch ranking after starting/restarting the game
      fetchRankingData(); // <<< CALL ADDED HERE
    } else {
      setMessage('无法加载关卡数据！');
      setGameView('enter_name'); // Stay in name entry if level fails
    }
  }, [username, fetchRankingData]); // Add fetchRankingData to dependencies

  // --- Submit Score Logic ---
  const submitScore = useCallback(async (finalGameState: GameState, timeMs: number) => {
      if (!username) return; // Should not happen if game started
      setIsSubmitting(true);
      setSubmitMessage('');
      try {
          const response = await fetch('/api/submit-score', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                  username: username,
                  score: finalGameState.score,
                  time: timeMs,
              }),
          });
          const result = await response.json();
          if (!response.ok) {
              throw new Error(result.error || result.details || 'Failed to submit score');
          }
          setSubmitMessage('分数提交成功！');
          // Refresh ranking after successful submission
          fetchRankingData(); // <<< CALL UNCOMMENTED AND UPDATED HERE
      } catch (error) {
          console.error("Failed to submit score:", error);
          setSubmitMessage(`分数提交失败: ${error instanceof Error ? error.message : '未知错误'}`);
      } finally {
          setIsSubmitting(false);
      }
  }, [username, fetchRankingData]); // Add fetchRankingData to dependencies

  // --- Handle Game End ---
  useEffect(() => {
    if (gameState && (gameState.isGameOver || gameState.isGameWon) && gameView === 'playing') {
      const endTime = Date.now();
      const durationMs = startTime ? endTime - startTime : 0;
      setFinalTimeMs(durationMs);
      setGameView('game_over'); // Change view

      // Set final message
      if (gameState.isGameWon) {
        setMessage(`恭喜 ${username}！你赢了！得分: ${gameState.score}, 用时: ${formatTime(durationMs)}`);
      } else if (gameState.isGameOver) {
        setMessage(`游戏结束 ${username}！槽满了。得分: ${gameState.score}, 用时: ${formatTime(durationMs)}`);
      }

      // Submit the score
      submitScore(gameState, durationMs);
    }
  }, [gameState, gameView, username, startTime, submitScore]); // Add submitScore to dependencies

  // --- Handle Card Click ---
  const handleCardClick = (cardId: number) => {
    if (gameState && gameView === 'playing' && !gameState.isGameOver && !gameState.isGameWon) {
      const newState = clickCard(gameState, cardId);
      setGameState(newState);
      // Game end logic is now handled by the useEffect above
    }
  };

  // --- Render Functions ---
  const renderDeckCard = (card: GameCard) => {
    if (!gameState) return null; // Guard against null gameState
    const leftPosition = card.initialX !== undefined ? card.initialX : (gameState.deck.indexOf(card) % 10) * 30 + (card.layer * 5);
    const topPosition = card.initialY !== undefined ? card.initialY : Math.floor(gameState.deck.indexOf(card) / 10) * 40 + (card.layer * 5);
    const cardPositionStyle: CSSProperties = { position: 'absolute', left: `${leftPosition}px`, top: `${topPosition}px`, zIndex: card.initialZ !== undefined ? card.initialZ : card.layer };
    const isUnclickable = !card.isFaceUp || card.coveredBy.length > 0;
    const faceUpStateClass = card.isFaceUp ? 'is-face-up' : 'face-down';
    const combinedClassName = `game-card-responsive ${isUnclickable ? 'is-unclickable' : ''} ${faceUpStateClass}`.trim().replace(/\s+/g, ' ');
    return <CardComponent key={`deck-${card.id}`} cardData={card} onClick={handleCardClick} style={cardPositionStyle} className={combinedClassName} />;
  };

  const renderSlotCard = (card: GameCard) => {
    const combinedClassName = `game-card-responsive is-face-up ${message.includes(card.type) && message.includes('消除') ? 'card-matched-animation' : ''}`.trim();
    return <CardComponent key={`slot-${card.id}`} cardData={{...card, isFaceUp: true}} onClick={() => {}} className={combinedClassName} />;
  };

  const formatTime = (ms: number): string => {
    if (ms < 0) return 'N/A';
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds}s`;
  }

  // --- Main Render Logic ---
  return (
    <div className="main-layout-container">
      {/* Game Area */}
      <div className="game-container">
        <h1 className="game-title">羊了个羊 {currentLevel ? `(关卡: ${currentLevel.name})` : ''}</h1>

        {/* View: Enter Name */}
        {gameView === 'enter_name' && (
          <div className="enter-name-container">
            <h2>请输入您的昵称</h2>
            <input
              ref={usernameInputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50} // Limit length
              placeholder="玩家昵称"
            />
            <button className="start-game-button" onClick={startGame}>开始游戏</button>
            {message && <p className="message-display" style={{ color: 'red' }}>{message}</p>}
          </div>
        )}

        {/* View: Playing or Game Over */}
        {(gameView === 'playing' || gameView === 'game_over') && gameState && currentLevel && (
          <>
            <p className="score-display">玩家: {username} | 得分: {gameState.score} {gameView === 'game_over' && finalTimeMs !== null ? `| 用时: ${formatTime(finalTimeMs)}` : ''}</p>
            {message && <p className="message-display" style={{ color: gameState.isGameWon ? 'green' : gameState.isGameOver ? 'red' : 'inherit' }}>{message}</p>}

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

            {gameView === 'game_over' && (
              <div className="game-over-controls">
                 {submitMessage && <p className={`submit-message ${submitMessage.includes('失败') ? 'error' : 'success'}`}>{submitMessage}</p>}
                 {/* Changed onClick to startGame directly as it now handles restart logic including ranking fetch */}
                 <button className="restart-button" onClick={startGame} disabled={isSubmitting}>
                   {isSubmitting ? '提交中...' : '重新开始'}
                 </button>
              </div>
            )}
          </>
        )}
         {/* Loading state for initial game load */}
         {gameView === 'enter_name' && !currentLevel && <p>正在加载关卡...</p>}
      </div>

      {/* Ranking Area */}
      <div className="ranking-container">
        <h2 className="ranking-title">排行榜 Top 10</h2>
        {rankingLoading && <p>正在加载排名...</p>}
        {rankingError && <p className="ranking-error">加载排名失败: {rankingError}</p>}
        {!rankingLoading && !rankingError && (
          <ol className="ranking-list">
            {rankingData.length > 0 ? (
              rankingData.map((item) => (
                <li key={item.rank} className="ranking-item">
                  <span className="rank">{item.rank}.</span>
                  <span className="username">{item.username}</span>
                  <span className="score">得分: {item.score}</span>
                  <span className="time">用时: {formatTime(item.time)}</span>
                </li>
              ))
            ) : (
              <p>暂无排名数据。</p>
            )}
          </ol>
        )}
      </div>
    </div>
  );
};

export default GameInterface;