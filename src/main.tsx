import React from 'react';
import ReactDOM from 'react-dom/client';
import GameInterface from '../components/GameInterface';
import './index.css'; // You might want to create a global CSS file

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <GameInterface />
  </React.StrictMode>,
);