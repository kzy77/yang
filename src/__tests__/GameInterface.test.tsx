import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import GameInterface from '@/components/GameInterface';

// 模拟游戏逻辑模块
jest.mock('@/game/logic', () => {
  const originalModule = jest.requireActual('@/game/logic');
  
  // 创建一些测试用的卡片数据
  const mockCards = Array.from({ length: 10 }, (_, i) => ({
    id: i,
    type: i % 3 === 0 ? 'sheep' : i % 3 === 1 ? 'grass' : 'wolf',
    isFaceUp: true,
    layer: 0,
    coveredBy: [],
    covering: [],
    initialX: i * 10,
    initialY: 0,
    initialZ: 1
  }));
  
  return {
    ...originalModule,
    initializeGame: jest.fn(() => ({
      deck: mockCards,
      slot: [],
      score: 0,
      isGameOver: false,
      isGameWon: false
    })),
    clickCard: jest.fn((state, cardId) => {
      const clickedCard = state.deck.find(card => card.id === cardId);
      return {
        ...state,
        deck: state.deck.filter(card => card.id !== cardId),
        slot: [...state.slot, clickedCard],
        score: state.score + 10
      };
    })
  };
});

// 模拟关卡数据
jest.mock('@/game/levels', () => ({
  getLevelById: jest.fn(() => ({
    id: 1,
    name: '测试关卡',
    cardTypes: ['sheep', 'grass', 'wolf'],
    cardsPerType: 3,
    layers: 1
  }))
}));

describe('GameInterface 组件', () => {
  test('应该正确渲染游戏界面', () => {
    render(<GameInterface />);
    
    // 检查游戏标题是否正确显示
    expect(screen.getByText(/羊了个羊/i)).toBeInTheDocument();
    expect(screen.getByText(/测试关卡/i)).toBeInTheDocument();
    
    // 检查得分显示
    expect(screen.getByText(/得分: 0/i)).toBeInTheDocument();
    
    // 检查消除槽标题
    expect(screen.getByText(/消除槽/i)).toBeInTheDocument();
  });
  
  test('点击卡片应该将其移到消除槽', () => {
    render(<GameInterface />);
    
    // 查找第一张卡片（通过ID标识符查找）
    const firstCard = screen.getByText(/ID: 0/i).closest('div');
    
    // 模拟点击卡片
    if (firstCard) {
      fireEvent.click(firstCard);
      
      // 检查得分是否更新
      expect(screen.getByText(/得分: 10/i)).toBeInTheDocument();
    }
  });
}); 