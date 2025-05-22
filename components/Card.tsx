// components/Card.tsx
import React from 'react';
import { Card as GameCardData } from '../game/logic'; // Assuming this is the interface for card data

interface CardProps {
  cardData: GameCardData;
  onClick: (id: number) => void;
  style?: React.CSSProperties; // For positioning from parent
  className?: string; // For animation classes
  // Add any other props needed for styling or interaction, e.g., isSelected, isMatched
}

const Card: React.FC<CardProps> = ({ cardData, onClick, style, className }) => {
  const { id, type, isFaceUp, layer } = cardData;

  const baseStyle: React.CSSProperties = {
    // width, height, and margin are now controlled by the '.game-card-responsive' class (via CSS variables)
    // and passed through the className prop from GameInterface.tsx.
    border: '1px solid #999',
    borderRadius: '8px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    cursor: isFaceUp ? 'pointer' : 'not-allowed',
    backgroundColor: isFaceUp ? '#fff' : '#b0bec5', // Light grey for face down
    boxShadow: '2px 2px 5px rgba(0,0,0,0.2)',
    transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
    fontSize: '24px', // Default font size for type. Consider moving to CSS if it needs to be responsive.
    fontWeight: 'bold',
    userSelect: 'none',
    position: 'relative', // For potential pseudo-elements or badges
    zIndex: layer, // Use layer for stacking context if needed directly
  };

  const faceUpStyle: React.CSSProperties = {
    // Specific styles for face-up cards
    // Example: Different background or border based on type
  };

  const faceDownStyle: React.CSSProperties = {
    // Specific styles for face-down cards
    // Could show a generic card back pattern
    backgroundImage: 'url(/card-back.svg)', // Placeholder for a card back image
    backgroundSize: 'cover',
  };

  const getCardContent = () => {
    if (!isFaceUp) {
      return <span style={{ fontSize: '30px', color: '#546e7a' }}>?</span>; // Question mark for face-down
    }
    // Simple text display for card type. Could be replaced with images/icons.
    switch (type) {
      case 'sheep':
        return <span role="img" aria-label="sheep">🐑</span>;
      case 'grass':
        return <span role="img" aria-label="grass">🌿</span>;
      case 'wolf':
        return <span role="img" aria-label="wolf">🐺</span>;
      case 'house':
        return <span role="img" aria-label="house">🏠</span>;
      case 'tree':
        return <span role="img" aria-label="tree">🌳</span>;
      case 'flower':
        return <span role="img" aria-label="flower">🌸</span>;
      case 'sun':
        return <span role="img" aria-label="sun">☀️</span>;
      case 'moon':
        return <span role="img" aria-label="moon">🌙</span>;
      default:
        return type.substring(0, 1).toUpperCase(); // Fallback to first letter
    }
  };

  const handleClick = () => {
    if (isFaceUp) {
      onClick(id);
    }
  };

  const combinedStyle = { ...baseStyle, ...(isFaceUp ? faceUpStyle : faceDownStyle), ...style };

  return (
    <div 
      className={`${className || ''} ${isFaceUp ? 'card-interactive' : ''} ${cardData.isFaceUp && !cardData.coveredBy.length ? 'card-flip-up-animation' : ''}`.trim()}
      style={combinedStyle}
      onClick={handleClick}
      // Hover effects can be managed by CSS :hover on .card-interactive if preferred
      // onMouseEnter={(e) => { if(isFaceUp) e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '3px 3px 8px rgba(0,0,0,0.3)'; }}
      // onMouseLeave={(e) => { if(isFaceUp) e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '2px 2px 5px rgba(0,0,0,0.2)'; }}
      role="button"
      aria-pressed={false} // This could be dynamic if cards can be 'selected' visually before moving to slot
      aria-label={`Card type ${type}, layer ${layer}, ${isFaceUp ? 'face up' : 'face down'}`}
    >
      {getCardContent()}
    </div>
  );
};

export default Card;