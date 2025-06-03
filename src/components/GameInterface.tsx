// components/GameInterface.tsx
import React, { useState, useEffect, CSSProperties, useRef, useCallback } from 'react';
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

// Define possible view states (kept for potential future use, but modal handles game over display now)
type GameView = 'enter_name' | 'playing' | 'game_over_pending_modal'; // Renamed 'game_over'

// --- New Type for Submission Status ---
type SubmissionStatus = 'idle' | 'pending' | 'success' | 'error';

const GameInterface: React.FC = () => {
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [currentLevel, setCurrentLevel] = useState<Level | null>(null);
  const [message, setMessage] = useState<string>(''); // General game messages
  const [gameView, setGameView] = useState<GameView>('enter_name');
  const [username, setUsername] = useState<string>('');
  const [startTime, setStartTime] = useState<number | null>(null);
  const [finalTimeMs, setFinalTimeMs] = useState<number | null>(null);
  // --- New State for Modal and Submission ---
  const [isGameOverModalOpen, setIsGameOverModalOpen] = useState<boolean>(false);
  const [submissionStatus, setSubmissionStatus] = useState<SubmissionStatus>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null); // Store specific error message
  // --- Ranking State ---
  const [rankingData, setRankingData] = useState<RankingItem[]>([]);
  const [rankingLoading, setRankingLoading] = useState<boolean>(true);
  const [rankingError, setRankingError] = useState<string | null>(null);
  const usernameInputRef = useRef<HTMLInputElement>(null);

  const fetchRankingData = useCallback(async () => {
    setRankingLoading(true);
    setRankingError(null);
    console.log("Fetching ranking data...");
    try {
      const response = await fetch('/api/ranking');
      if (!response.ok) {
        let errorDetails = `加载排名失败 (状态: ${response.status})`; // Default with status
        try {
          // Attempt to parse JSON, but handle non-JSON or unexpected structures
          const errorData = await response.json();
          if (typeof errorData === 'object' && errorData !== null) {
             // Prioritize 'error', then 'details', then stringify if unknown structure
             errorDetails = errorData.error || errorData.details || JSON.stringify(errorData);
          } else if (typeof errorData === 'string') {
             errorDetails = errorData; // Use if the error response is just a string
          }
        } catch (parseError) {
           // If JSON parsing fails, keep the default message or try reading as text
           console.warn("无法将错误响应解析为 JSON:", parseError);
           try {
               const textError = await response.text(); // Try reading as plain text
               if (textError) errorDetails = textError.substring(0, 100); // Limit length
           } catch {} // Ignore error reading as text
        }
        // Construct the final error message for the state
        throw new Error(errorDetails); // Throw the extracted/default details
      }
      const data: RankingItem[] = await response.json();
      setRankingData(data);
      console.log("Ranking data fetched successfully:", data);
    } catch (error) {
      console.error("Failed to fetch ranking:", error);
      setRankingError(error instanceof Error ? error.message : 'An unknown error occurred');
    } finally {
      setRankingLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRankingData();
  }, [fetchRankingData]);

  // --- Game Initialization / Restart Logic ---
  const startGame = useCallback(() => {
    if (gameView === 'enter_name' && username.trim() === '') {
        setMessage('请输入用户名！');
        usernameInputRef.current?.focus();
        return;
    }
    const levelData = getLevelById(1);
    if (levelData) {
      setCurrentLevel(levelData);
      const initialGs = initializeGame(levelData.cardTypes, levelData.cardsPerType, levelData.layers);
      setGameState(initialGs);
      setMessage('');
      setFinalTimeMs(null);
      setStartTime(Date.now());
      setGameView('playing'); // Set to playing view
      setIsGameOverModalOpen(false); // Ensure modal is closed on start/restart
      setSubmissionStatus('idle'); // Reset submission status
      setSubmissionError(null); // Clear any previous submission error
      fetchRankingData();
    } else {
      setMessage('无法加载关卡数据！');
      setGameView('enter_name');
    }
  }, [username, fetchRankingData, gameView]); // Added gameView dependency

  // --- Submit Score Logic (Modified) ---
  const submitScore = useCallback(async (finalGameState: GameState, timeMs: number) => {
      if (!username) return;
      setSubmissionStatus('pending'); // Set status to pending
      setSubmissionError(null); // Clear previous error
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
          setSubmissionStatus('success'); // Set status to success
          fetchRankingData();
      } catch (error) {
          console.error("Failed to submit score:", error);
          const errorMessage = error instanceof Error ? error.message : '未知错误';
          setSubmissionStatus('error'); // Set status to error
          setSubmissionError(errorMessage); // Store the error message
      }
      // No finally block needed to change status from pending
  }, [username, fetchRankingData]);

  // --- Handle Game End (Modified) ---
  useEffect(() => {
    // Only trigger game over logic if the game state indicates game over/won AND we are currently in the 'playing' view
    if (gameState && (gameState.isGameOver || gameState.isGameWon) && gameView === 'playing') {
      const endTime = Date.now();
      const durationMs = startTime ? endTime - startTime : 0;
      setFinalTimeMs(durationMs);
      setGameView('game_over_pending_modal'); // Indicate game is over, modal will show

      // Set final message (will be shown in modal)
      if (gameState.isGameWon) {
        setMessage(`恭喜 ${username}！你赢了！`); // Simplified message for modal
      } else if (gameState.isGameOver) {
        // Specifically check if it's game over because the slot is full
        const slotIsFull = gameState.slot.length >= 7; // Assuming MAX_SLOT_SIZE is 7 from logic.ts
        if (slotIsFull) {
            setMessage(`游戏结束 ${username}！槽满了。`); // Specific message for slot full
        } else {
             setMessage(`游戏结束 ${username}！`); // Generic game over message if needed
        }
      }

      // Show the modal and submit the score
      setIsGameOverModalOpen(true);
      submitScore(gameState, durationMs);
    }
  }, [gameState, gameView, username, startTime, submitScore]); // Keep dependencies

  // --- Handle Card Click ---
  const handleCardClick = (cardId: number) => {
    if (gameState && gameView === 'playing' && !gameState.isGameOver && !gameState.isGameWon) {
      const newState = clickCard(gameState, cardId);
      setGameState(newState);
      // Game end logic is handled by the useEffect above
    }
  };

  // --- Handle Restart (New Function) ---
  const handleRestart = useCallback(() => {
      // Simply call startGame, which now contains all reset logic
      startGame();
  }, [startGame]);

  // --- Render Functions ---
  const renderDeckCard = (card: GameCard) => {
    if (!gameState) return null;
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

  const formatTime = (ms: number | null): string => {
    if (ms === null || ms < 0) return 'N/A';
    const seconds = (ms / 1000).toFixed(2);
    return `${seconds}s`;
  }

  // --- Render Game Over Modal (New Function) ---
  const renderGameOverModal = () => {
    if (!isGameOverModalOpen || !gameState) return null;

    const title = gameState.isGameWon ? `恭喜 ${username}！你赢了！` : `游戏结束 ${username}！槽满了。`;
    const scoreInfo = `得分: ${gameState.score}, 用时: ${formatTime(finalTimeMs)}`;

    let statusMessage = '';
    switch (submissionStatus) {
        case 'pending':
            statusMessage = '正在提交分数...';
            break;
        case 'success':
            statusMessage = '分数提交成功！';
            break;
        case 'error':
            statusMessage = `分数提交失败: ${submissionError || '未知错误'}`;
            break;
        case 'idle': // Should not typically be idle when modal is open after game end, but handle just in case
        default:
            statusMessage = ''; // Or perhaps '准备提交...'
            break;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>{title}</h2>
                <p>{scoreInfo}</p>
                {statusMessage && <p className={`submission-status ${submissionStatus}`}>{statusMessage}</p>}
                <button
                    className="restart-button-modal"
                    onClick={handleRestart}
                    disabled={submissionStatus === 'pending'} // Disable while submitting
                >
                    {submissionStatus === 'pending' ? '请稍候...' : '重新开始'}
                </button>
            </div>
            {/* Basic styling for the modal */}
            <style jsx>{`
                .modal-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background-color: rgba(0, 0, 0, 0.6);
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    z-index: 1000; /* Ensure it's on top */
                }
                .modal-content {
                    background-color: white;
                    padding: 30px;
                    border-radius: 8px;
                    text-align: center;
                    color: #333;
                    min-width: 300px;
                    box-shadow: 0 4px 15px rgba(0,0,0,0.2);
                }
                .modal-content h2 {
                    margin-top: 0;
                    color: #d9534f; /* Reddish for game over */
                }
                .modal-content p {
                    margin-bottom: 15px;
                    font-size: 1.1em;
                }
                .submission-status {
                    font-weight: bold;
                    margin-top: 20px;
                    padding: 8px;
                    border-radius: 4px;
                }
                .submission-status.pending { color: #888; }
                .submission-status.success { color: green; background-color: #e8f5e9; }
                .submission-status.error { color: red; background-color: #fdecea; }

                .restart-button-modal {
                    padding: 12px 25px;
                    font-size: 1.1em;
                    cursor: pointer;
                    background-color: #5cb85c; /* Green */
                    color: white;
                    border: none;
                    border-radius: 5px;
                    transition: background-color 0.2s;
                }
                .restart-button-modal:hover:not(:disabled) {
                    background-color: #4cae4c;
                }
                .restart-button-modal:disabled {
                    background-color: #cccccc;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
  }


  // --- Main Render Logic (Updated) ---
  return (
    <div className="main-layout-container">
      {/* Game Area */}
      <div className="game-container">

        {/* --- Title and Restart Button Section --- */}
        <div className="title-section">
          {(gameView === 'playing' || gameView === 'game_over_pending_modal') && (
               <button className="restart-button-above-title" onClick={handleRestart}>
                   玩不下去了，再来一把
               </button>
          )}
          <h1 className="game-title">羊了个羊 {currentLevel ? `(关卡: ${currentLevel.name})` : ''}</h1>
        </div>

        {/* View: Enter Name */}
        {gameView === 'enter_name' && (
          <div className="enter-name-container">
            <h2>请输入您的昵称</h2>
            <input
              ref={usernameInputRef}
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              maxLength={50}
              placeholder="玩家昵称"
            />
            <button className="start-game-button" onClick={startGame}>开始游戏</button>
            {message && <p className="message-display" style={{ color: 'red' }}>{message}</p>}
          </div>
        )}

        {/* View: Playing or Game Over (but modal handles actual game over display) */}
        {(gameView === 'playing' || gameView === 'game_over_pending_modal') && gameState && currentLevel && (
          <>
            {/* Display score/time only when playing, modal shows final stats */}
            {gameView === 'playing' && (
                 <p className="score-display">玩家: {username} | 得分: {gameState.score}</p>
            )}
            {/* General messages might still appear here briefly before modal */}
            {message && gameView !== 'game_over_pending_modal' && <p className="message-display" style={{ color: gameState.isGameWon ? 'green' : gameState.isGameOver ? 'red' : 'inherit' }}>{message}</p>}

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

            {/* Removed old game over controls */}
          </>
        )}
         {/* Loading state for initial game load */}
         {gameView === 'enter_name' && !currentLevel && <p>正在加载关卡...</p>}

         {/* Render the Game Over Modal */}
         {renderGameOverModal()}

         {/* Basic styling for the title section and the centered button */}
         <style jsx>{`
            .title-section {
                display: flex;
                flex-direction: column;
                align-items: center;
                margin-bottom: 10px; /* Reduced spacing below title */
                width: 100%; /* Ensure it takes full width for centering */
            }
            .restart-button-above-title {
                /* Removed position, top, left, z-index */
                margin-bottom: 10px; /* Space between button and title */
                padding: 8px 15px;
                background-color: #f0ad4e; /* Orange warning color */
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
                font-size: 0.9em;
                transition: background-color 0.2s;
            }
            .restart-button-above-title:hover {
                background-color: #ec971f;
            }
            .game-title {
                /* Existing styles for game-title likely in globals.css or responsive.css */
                /* No additional styles needed here unless overriding */
                margin: 0; /* Remove default margin if needed */
            }
         `}</style>
      </div>

      {/* Ranking Area (Unchanged) */}
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