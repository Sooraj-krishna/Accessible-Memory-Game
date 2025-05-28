import React, { useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { gameSounds } from '@/lib/generateSounds';
import { useMemoryGame } from '@/hooks/useMemoryGame';
import { levels } from '@/data/gameData';

interface GameCard {
  id: string;
  content: string;
  description: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

interface Level {
  name: string;
  rows: number;
  cols: number;
  description: string;
}

// Memoized game card component
const GameCard = React.memo(({ 
  card, 
  row, 
  col, 
  isCurrentPosition, 
  onCardClick,
  level
}: {
  card: GameCard;
  row: number;
  col: number;
  isCurrentPosition: boolean;
  onCardClick: () => void;
  level: Level;
}) => (
  <Card
    className={`w-24 h-24 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
      isCurrentPosition ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''
    } ${
      card.isMatched ? 'bg-green-100 border-green-300' : ''
    } ${
      card.isFlipped && !card.isMatched ? 'bg-blue-100 border-blue-300' : ''
    }`}
    onClick={onCardClick}
    role="gridcell"
    aria-label={
      card.isMatched 
        ? `Row ${row + 1}, Column ${col + 1}. Matched: ${card.content}`
        : card.isFlipped 
        ? `Row ${row + 1}, Column ${col + 1}. Showing: ${card.content}`
        : `Row ${row + 1}, Column ${col + 1}. Hidden card`
    }
    tabIndex={isCurrentPosition ? 0 : -1}
  >
    <CardContent className="flex items-center justify-center h-full p-2">
      {card.isFlipped || card.isMatched ? (
        <div className="text-center">
          <div className="text-2xl mb-1">{card.emoji}</div>
          <div className="text-xs font-medium text-gray-700">
            {card.content}
          </div>
        </div>
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-gray-300 to-gray-400 rounded flex items-center justify-center">
          <span className="text-2xl">❓</span>
        </div>
      )}
    </CardContent>
  </Card>
));

GameCard.displayName = 'GameCard';

// Help Menu Component
const HelpMenu = React.memo(({ onClose }: { onClose: () => void }) => (
  <div 
    className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
    role="dialog"
    aria-label="Keyboard shortcuts help menu"
  >
    <Card className="max-w-lg w-full">
      <CardContent className="p-6">
        <h2 className="text-2xl font-bold mb-4">Keyboard Shortcuts</h2>
        <div className="space-y-2">
          <p>⬆️ ⬇️ ⬅️ ➡️ Arrow keys: Navigate the game grid</p>
          <p>Tab: Move to next card</p>
          <p>Space or Enter: Select/flip a card</p>
          <p>H: Toggle this help menu</p>
          <p>M: Toggle sound effects</p>
          <p>R: Read current position</p>
          <p>P: Hear current progress</p>
          <p>Escape: Return to main menu</p>
        </div>
        <Button 
          onClick={onClose}
          className="mt-4 w-full"
          aria-label="Close help menu"
        >
          Close Help (Press H)
        </Button>
      </CardContent>
    </Card>
  </div>
));

HelpMenu.displayName = 'HelpMenu';

export const AccessibleMemoryGame = () => {
  const announcementRef = useRef<HTMLDivElement>(null);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(false);

  const announce = (message: string, sound?: keyof typeof gameSounds) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
      if (sound && isSoundEnabled) {
        gameSounds[sound]();
      }
    }
  };

  const {
    currentLevel,
    setCurrentLevel,
    gameState,
    setGameState,
    cards,
    matchedPairs,
    currentPosition,
    setCurrentPosition,
    score,
    moves,
    level,
    totalPairs,
    initializeGame,
    handleCardSelect,
    getPositionAnnouncement
  } = useMemoryGame({ onAnnounce: announce });

  if (gameState === 'menu') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
        <div 
          ref={announcementRef}
          aria-live="polite"
          className="sr-only"
          role="status"
        />
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">
              Accessible Memory Game
            </h1>
            <p className="text-lg text-gray-600 mb-2">
              An educational memory game designed for visually impaired children
            </p>
            <p className="text-md text-gray-500">
              Use tab and arrow keys to navigate, Enter or Space to select cards
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {levels.map((levelInfo, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-200 hover:shadow-lg ${
                  currentLevel === index ? 'ring-2 ring-blue-500 bg-blue-50' : ''
                }`}
                onClick={() => setCurrentLevel(index)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentLevel(index);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${levelInfo.name} level. ${levelInfo.description}`}
              >
                <CardContent className="p-6 text-center">
                  <h3 className="text-xl font-semibold mb-2">{levelInfo.name}</h3>
                  <p className="text-gray-600 mb-4">{levelInfo.description}</p>
                  <Badge variant={currentLevel === index ? "default" : "secondary"}>
                    {levelInfo.rows}×{levelInfo.cols} Grid
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center mt-8">
            <Button 
              onClick={initializeGame}
              size="lg"
              className="text-lg px-8 py-3"
              aria-label={`Start ${levels[currentLevel].name} level game`}
            >
              Start Game
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'complete') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 p-4 flex items-center justify-center">
        <div 
          ref={announcementRef}
          aria-live="polite"
          className="sr-only"
          role="status"
        />
        
        <Card className="max-w-md mx-auto">
          <CardContent className="p-8 text-center">
            <h2 className="text-3xl font-bold text-green-600 mb-4">
              🎉 Congratulations!
            </h2>
            <p className="text-lg mb-4">You completed the {level.name} level!</p>
            <div className="space-y-2 mb-6">
              <p className="text-gray-600">Final Score: <span className="font-semibold">{score}</span></p>
              <p className="text-gray-600">Total Moves: <span className="font-semibold">{moves}</span></p>
            </div>
            <div className="space-y-3">
              <Button 
                onClick={initializeGame}
                className="w-full"
                aria-label="Play same level again"
              >
                Play Again
              </Button>
              <Button 
                onClick={() => setGameState('menu')}
                variant="outline"
                className="w-full"
                aria-label="Return to level selection menu"
              >
                Choose Different Level
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50 p-4">
      <div 
        ref={announcementRef}
        aria-live="polite"
        className="sr-only"
        role="status"
      />
      
      {showHelp && <HelpMenu onClose={() => setShowHelp(false)} />}
      
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{level.name} Level</h2>
            <p className="text-gray-600">
              Score: {score} | Moves: {moves} | Pairs: {matchedPairs}/{totalPairs}
            </p>
          </div>
          <div className="flex gap-2">
            <Button 
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              variant="outline"
              aria-label={`${isSoundEnabled ? 'Disable' : 'Enable'} sound effects`}
            >
              {isSoundEnabled ? '🔊' : '🔇'}
            </Button>
            <Button 
              onClick={() => setShowHelp(true)}
              variant="outline"
              aria-label="Show keyboard shortcuts"
            >
              ❓ Help
            </Button>
            <Button 
              onClick={() => setGameState('menu')}
              variant="outline"
              aria-label="Return to main menu"
            >
              Main Menu
            </Button>
          </div>
        </div>

        {/* Game Instructions */}
        <div className="mb-6 p-4 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Use tab and arrow keys to navigate the grid. 
            Press Enter or Space to select a card. Find matching pairs to win!
          </p>
        </div>

        {/* Game Grid */}
        <div 
          className="grid gap-4 mx-auto max-w-fit"
          style={{ 
            gridTemplateColumns: `repeat(${level.cols}, 1fr)`,
            gridTemplateRows: `repeat(${level.rows}, 1fr)`
          }}
          role="grid"
          aria-label={`Memory game grid, ${level.rows} rows by ${level.cols} columns`}
        >
          {cards.map((card, index) => {
            const row = Math.floor(index / level.cols);
            const col = index % level.cols;
            const isCurrentPosition = row === currentPosition.row && col === currentPosition.col;
            
            return (
              <GameCard
                key={card.id}
                card={card}
                row={row}
                col={col}
                isCurrentPosition={isCurrentPosition}
                onCardClick={() => {
                  setCurrentPosition({ row, col });
                  handleCardSelect();
                }}
                level={level}
              />
            );
          })}
        </div>

        {/* Current Position Indicator */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Current position: Row {currentPosition.row + 1}, Column {currentPosition.col + 1}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AccessibleMemoryGame);
