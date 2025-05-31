// components/Card.tsx
import React from 'react';
import { Card as GameCard } from '@/game/logic'; // Assuming Card type is exported from logic.ts

interface CardProps {
  cardData: GameCard;
  onClick: (id: number) => void;
  style?: React.CSSProperties; // Optional style prop for positioning
  className?: string; // Optional className prop
}

const CardComponent: React.FC<CardProps> = ({ cardData, onClick, style, className }) => {
  // Always render card type, using SVG icons
  let iconContent;
  switch (cardData.type) {
    case 'sheep':
      iconContent = (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Simple sheep icon */}
          <circle cx="50" cy="60" r="20" fill="#eee" />
          <circle cx="40" cy="60" r="5" fill="#333" />
          <circle cx="60" cy="60" r="5" fill="#333" />
          <ellipse cx="50" cy="40" rx="15" ry="10" fill="#eee" />
          <line x1="45" y1="35" x2="40" y2="30" stroke="#333" strokeWidth="2" />
          <line x1="55" y1="35" x2="60" y2="30" stroke="#333" strokeWidth="2" />
        </svg>
      );
      break;
    case 'grass': // From UXWing <mcreference link="https://uxwing.com/garden-grass-icon/" index="2">2</mcreference>
      iconContent = (
        <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg">
          <path d="M55.62 53.06S50.81 39.22 48.26 39c-2.56-.21-3.3 4-3.3 4s-3.13-10.18-5.08-10.18-2.45 5.88-2.45 5.88-2.74-8.82-4.59-8.82-2.26 5.15-2.26 5.15-2.45-9.1-4.89-9.1-2.84 6.71-2.84 6.71-3.48-10.39-5.92-10.39-1.63 3.48-1.63 3.48L8.38 53.06Z" fill="#79bd42"/>
          <path d="M55.62 53.06S50.81 39.22 48.26 39c-2.56-.21-3.3 4-3.3 4s-3.13-10.18-5.08-10.18-2.45 5.88-2.45 5.88-2.74-8.82-4.59-8.82-2.26 5.15-2.26 5.15-2.45-9.1-4.89-9.1-2.84 6.71-2.84 6.71-3.48-10.39-5.92-10.39-1.63 3.48-1.63 3.48L8.38 53.06Z" fill="none" stroke="#4d7c27" strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"/>
        </svg>
      );
      break;
    case 'wolf':
      iconContent = (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Simple wolf icon */}
          <polygon points="50,10 20,90 80,90" fill="#888" />
          <circle cx="40" cy="40" r="5" fill="#fff" />
          <circle cx="60" cy="40" r="5" fill="#fff" />
          <polygon points="45,60 55,60 50,70" fill="#f00" />
        </svg>
      );
      break;
    case 'house':
      iconContent = (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Simple house icon */}
          <rect x="20" y="50" width="60" height="40" fill="#f0ad4e" />
          <polygon points="10,50 90,50 50,20" fill="#d9534f" />
          <rect x="40" y="70" width="20" height="20" fill="#5bc0de" />
        </svg>
      );
      break;
    case 'tree':
      iconContent = (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          {/* Simple tree icon */}
          <rect x="45" y="60" width="10" height="30" fill="#8B4513" />
          <circle cx="50" cy="40" r="25" fill="#228B22" />
          <circle cx="35" cy="45" r="15" fill="#228B22" />
          <circle cx="65" cy="45" r="15" fill="#228B22" />
        </svg>
      );
      break;
    case 'flower': // From svgsilh.com <mcreference link="https://svgsilh.com/" index="3">3</mcreference>
      iconContent = (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm-1-13h2v6h-2zm0 8h2v2h-2z" fill="#FFC107"/>
          <circle cx="12" cy="12" r="3" fill="#FF5722"/>
        </svg>
      );
      break;
    case 'sun': // From reshot.com <mcreference link="https://www.reshot.com/free-svg-icons/sun/" index="1">1</mcreference>
      iconContent = (
        <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <path d="M12,4A8,8,0,1,1,4,12,8,8,0,0,1,12,4M12,2A10,10,0,1,0,22,12,10,10,0,0,0,12,2Z" fill="#FFEB3B"/>
          <path d="M12,7a1,1,0,0,0-1,1V9a1,1,0,0,0,2,0V8A1,1,0,0,0,12,7Z" fill="#FFC107"/>
          <path d="M12,15a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V16A1,1,0,0,0,12,15Z" fill="#FFC107"/>
          <path d="M7.05,7.05A1,1,0,0,0,6.34,8.46l1.42,1.42A1,1,0,0,0,9.17,8.46L7.76,7.05A1,1,0,0,0,7.05,7.05Z" fill="#FFC107"/>
          <path d="M15.12,15.12a1,1,0,0,0-.71.29l-1.41,1.42a1,1,0,1,0,1.41,1.41l1.42-1.41A1,1,0,0,0,15.12,15.12Z" fill="#FFC107"/>
          <path d="M4,12a1,1,0,0,0,1,1H6a1,1,0,0,0,0-2H5A1,1,0,0,0,4,12Z" fill="#FFC107"/>
          <path d="M18,12a1,1,0,0,0,1,1h1a1,1,0,0,0,0-2H19A1,1,0,0,0,18,12Z" fill="#FFC107"/>
          <path d="M7.05,16.95a1,1,0,0,0,1.41-.09L9.88,15.12a1,1,0,0,0-1.41-1.41L7.05,15.12A1,1,0,0,0,7.05,16.95Z" fill="#FFC107"/>
          <path d="M15.12,8.88a1,1,0,0,0,1.41-.09L17.95,7.05a1,1,0,0,0-1.41-1.41L15.12,7.05A1,1,0,0,0,15.12,8.88Z" fill="#FFC107"/>
        </svg>
      );
      break;
    case 'moon':
      iconContent = (
        <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 10 A 40 40 0 1 0 50 90 A 30 30 0 1 1 50 10 Z" fill="#f0e68c"/>
        </svg>
      );
      break;
    default:
      iconContent = <span>{cardData.type}</span>; // Fallback to text if no icon
  }
  const displayContent = <span className="card-type-display">{iconContent}</span>;

  // Combine provided className with default and conditional classes
  const combinedClassName = `game-card ${className || ''} ${!cardData.isFaceUp ? 'is-disabled face-down' : 'is-face-up'}`.trim();

  return (
    <div
      data-testid={`card-${cardData.id}`}
      style={{ ...style, zIndex: Math.round((cardData.initialZ || 0) * 100) }} // 使用空值合并确保initialZ未定义时默认为0
      className={combinedClassName}
      onClick={() => cardData.isFaceUp && cardData.coveredBy.length === 0 && onClick(cardData.id)} // Clickable only if isFaceUp and coveredBy.length === 0
    >
      {displayContent}
      <span style={{ position: 'absolute', top: '2px', left: '2px', fontSize: '10px', color: '#888', zIndex: 1 }}>
        ID: {cardData.id}
      </span>
    </div>
  );
};

export default CardComponent;