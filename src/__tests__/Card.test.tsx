import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CardComponent from '@/components/Card';

describe('Card 组件', () => {
  const mockCardData = {
    id: 1,
    type: 'sheep',
    isFaceUp: true,
    layer: 0,
    coveredBy: [],
    covering: [],
    initialX: 10,
    initialY: 20,
    initialZ: 1
  };
  
  const mockOnClick = jest.fn();
  
  test('应该正确渲染卡片', () => {
    render(
      <CardComponent 
        cardData={mockCardData} 
        onClick={mockOnClick} 
      />
    );
    
    // 检查卡片ID是否正确显示
    expect(screen.getByText(/ID: 1/i)).toBeInTheDocument();
    
    // 检查卡片是否有正确的类名
    const cardElement = screen.getByText(/ID: 1/i).closest('div');
    expect(cardElement).toHaveClass('game-card');
    expect(cardElement).toHaveClass('is-face-up');
  });
  
  test('点击卡片时应该调用onClick回调', () => {
    render(
      <CardComponent 
        cardData={mockCardData} 
        onClick={mockOnClick} 
      />
    );
    
    const cardElement = screen.getByText(/ID: 1/i).closest('div');
    if (cardElement) {
      fireEvent.click(cardElement);
      expect(mockOnClick).toHaveBeenCalledWith(1);
    }
  });
  
  test('当卡片不是正面朝上时，点击不应调用onClick', () => {
    const faceDownCard = { ...mockCardData, isFaceUp: false };
    
    render(
      <CardComponent 
        cardData={faceDownCard} 
        onClick={mockOnClick} 
      />
    );
    
    const cardElement = screen.getByText(/ID: 1/i).closest('div');
    if (cardElement) {
      fireEvent.click(cardElement);
      expect(mockOnClick).not.toHaveBeenCalled();
    }
  });
  
  test('应该正确应用自定义样式和类名', () => {
    const customStyle = { backgroundColor: 'red' };
    const customClassName = 'custom-card';
    
    render(
      <CardComponent 
        cardData={mockCardData} 
        onClick={mockOnClick}
        style={customStyle}
        className={customClassName}
      />
    );
    
    const cardElement = screen.getByText(/ID: 1/i).closest('div');
    expect(cardElement).toHaveClass(customClassName);
    expect(cardElement).toHaveStyle('background-color: red');
  });
}); 