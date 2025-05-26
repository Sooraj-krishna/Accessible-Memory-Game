
import React, { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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

const levels: Level[] = [
  { name: "Beginner", rows: 2, cols: 3, description: "2 rows, 3 columns - 6 cards total" },
  { name: "Intermediate", rows: 3, cols: 4, description: "3 rows, 4 columns - 12 cards total" },
  { name: "Advanced", rows: 4, cols: 4, description: "4 rows, 4 columns - 16 cards total" }
];

const gameCards = [
  { content: "Lion", description: "The lion is the king of animals, known for its powerful roar and majestic mane", emoji: "🦁" },
  { content: "Elephant", description: "Elephants are gentle giants with excellent memory and strong family bonds", emoji: "🐘" },
  { content: "Tiger", description: "Tigers are powerful striped cats, excellent hunters with incredible strength", emoji: "🐅" },
  { content: "Bear", description: "Bears are strong, intelligent mammals that can stand on their hind legs", emoji: "🐻" },
  { content: "Eagle", description: "Eagles are magnificent birds of prey with excellent eyesight and powerful wings", emoji: "🦅" },
  { content: "Dolphin", description: "Dolphins are intelligent marine mammals known for their playful nature", emoji: "🐬" },
  { content: "Butterfly", description: "Butterflies are beautiful insects that transform from caterpillars", emoji: "🦋" },
  { content: "Owl", description: "Owls are wise nocturnal birds with excellent hearing and silent flight", emoji: "🦉" }
];

export const AccessibleMemoryGame = () => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'complete'>('menu');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 0 });
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const gameGridRef = useRef<HTMLDivElement>(null);
  const announcementRef = useRef<HTMLDivElement>(null);

  const level = levels[currentLevel];
  const totalPairs = (level.rows * level.cols) / 2;

  // Announce to screen reader
  const announce = (message: string) => {
    if (announcementRef.current) {
      announcementRef.current.textContent = message;
    }
  };

  // Initialize game
  const initializeGame = () => {
    const totalCards = level.rows * level.cols;
    const selectedCards = gameCards.slice(0, totalCards / 2);
    const duplicatedCards = [...selectedCards, ...selectedCards];
    
    const shuffledCards = duplicatedCards
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        id: `card-${index}`,
        content: card.content,
        description: card.description,
        emoji: card.emoji,
        isFlipped: false,
        isMatched: false
      }));

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setCurrentPosition({ row: 0, col: 0 });
    setScore(0);
    setMoves(0);
    setGameState('playing');
    
    announce(`Game started! ${level.name} level. Navigate with arrow keys. Current position: Row 1, Column 1`);
  };

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (gameState !== 'playing') return;

      const { row, col } = currentPosition;
      let newRow = row;
      let newCol = col;

      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          newRow = Math.max(0, row - 1);
          break;
        case 'ArrowDown':
          e.preventDefault();
          newRow = Math.min(level.rows - 1, row + 1);
          break;
        case 'ArrowLeft':
          e.preventDefault();
          newCol = Math.max(0, col - 1);
          break;
        case 'ArrowRight':
          e.preventDefault();
          newCol = Math.min(level.cols - 1, col + 1);
          break;
        case 'Enter':
        case ' ':
          e.preventDefault();
          handleCardSelect();
          break;
      }

      if (newRow !== row || newCol !== col) {
        setCurrentPosition({ row: newRow, col: newCol });
        const cardIndex = newRow * level.cols + newCol;
        const card = cards[cardIndex];
        
        if (card) {
          if (card.isMatched) {
            announce(`Position Row ${newRow + 1}, Column ${newCol + 1}. Matched pair: ${card.content}`);
          } else if (card.isFlipped) {
            announce(`Position Row ${newRow + 1}, Column ${newCol + 1}. Currently showing: ${card.content}`);
          } else {
            announce(`Position Row ${newRow + 1}, Column ${newCol + 1}. Hidden card`);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [gameState, currentPosition, level, cards]);

  // Handle card selection
  const handleCardSelect = () => {
    const cardIndex = currentPosition.row * level.cols + currentPosition.col;
    const card = cards[cardIndex];

    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      return;
    }

    const newFlippedCards = [...flippedCards, card.id];
    setFlippedCards(newFlippedCards);
    setMoves(moves + 1);

    // Update card state
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === card.id ? { ...c, isFlipped: true } : c
      )
    );

    announce(`Card revealed: ${card.content}`);

    // Check for match
    if (newFlippedCards.length === 2) {
      const firstCard = cards.find(c => c.id === newFlippedCards[0]);
      const secondCard = cards.find(c => c.id === newFlippedCards[1]);

      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        // Match found
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              newFlippedCards.includes(c.id) ? { ...c, isMatched: true } : c
            )
          );
          setMatchedPairs(matchedPairs + 1);
          setScore(score + 10);
          setFlippedCards([]);
          
          announce(`Correct! ${firstCard.content}. ${firstCard.description}`);
          
          if (matchedPairs + 1 === totalPairs) {
            setTimeout(() => {
              setGameState('complete');
              announce(`Congratulations! Game completed in ${moves + 1} moves. Final score: ${score + 10}`);
            }, 1000);
          }
        }, 1000);
      } else {
        // No match
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          announce("No match. Cards flipped back. Try again!");
        }, 2000);
      }
    }
  };

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
              Use arrow keys to navigate, Enter or Space to select cards
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
      
      <div className="max-w-4xl mx-auto">
        {/* Game Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{level.name} Level</h2>
            <p className="text-gray-600">Score: {score} | Moves: {moves} | Pairs: {matchedPairs}/{totalPairs}</p>
          </div>
          <Button 
            onClick={() => setGameState('menu')}
            variant="outline"
            aria-label="Return to main menu"
          >
            Main Menu
          </Button>
        </div>

        {/* Game Instructions */}
        <div className="mb-6 p-4 bg-blue-100 rounded-lg">
          <p className="text-sm text-blue-800">
            <strong>Instructions:</strong> Use arrow keys to navigate the grid. 
            Press Enter or Space to select a card. Find matching pairs to win!
          </p>
        </div>

        {/* Game Grid */}
        <div 
          ref={gameGridRef}
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
              <Card
                key={card.id}
                className={`w-24 h-24 cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                  isCurrentPosition ? 'ring-4 ring-yellow-400 bg-yellow-50' : ''
                } ${
                  card.isMatched ? 'bg-green-100 border-green-300' : ''
                } ${
                  card.isFlipped && !card.isMatched ? 'bg-blue-100 border-blue-300' : ''
                }`}
                onClick={() => {
                  setCurrentPosition({ row, col });
                  handleCardSelect();
                }}
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
