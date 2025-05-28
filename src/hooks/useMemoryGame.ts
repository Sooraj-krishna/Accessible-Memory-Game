import { useState, useCallback, useMemo } from 'react';
import { GameCard, Level } from '@/types/game';
import { levels, gameCards } from '@/data/gameData';
import { gameSounds } from '@/lib/generateSounds';

interface UseMemoryGameProps {
  onAnnounce: (message: string, sound?: keyof typeof gameSounds) => void;
}

export const useMemoryGame = ({ onAnnounce }: UseMemoryGameProps) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'complete'>('menu');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 0 });
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);

  // Memoize current level and total pairs
  const level = useMemo(() => levels[currentLevel], [currentLevel]);
  const totalPairs = useMemo(() => (level.rows * level.cols) / 2, [level.rows, level.cols]);

  // Generate shuffled cards
  const generateShuffledCards = useCallback((totalCards: number) => {
    const selectedCards = gameCards.slice(0, totalCards / 2);
    const duplicatedCards = [...selectedCards, ...selectedCards];
    
    return duplicatedCards
      .sort(() => Math.random() - 0.5)
      .map((card, index) => ({
        id: `card-${index}`,
        content: card.content,
        description: card.description,
        emoji: card.emoji,
        isFlipped: false,
        isMatched: false
      }));
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    const totalCards = level.rows * level.cols;
    const shuffledCards = generateShuffledCards(totalCards);

    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setCurrentPosition({ row: 0, col: 0 });
    setScore(0);
    setMoves(0);
    setGameState('playing');
    
    onAnnounce(`Game started! ${level.name} level. Navigate with tab and arrow keys. Current position: Row 1, Column 1`);
  }, [level, generateShuffledCards, onAnnounce]);

  // Handle card selection
  const handleCardSelect = useCallback(() => {
    const cardIndex = currentPosition.row * level.cols + currentPosition.col;
    const card = cards[cardIndex];

    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      onAnnounce('This card cannot be selected');
      return;
    }

    const newFlippedCards = [...flippedCards, card.id];
    setFlippedCards(newFlippedCards);
    setMoves(moves + 1);

    setCards(prevCards => 
      prevCards.map(c => 
        c.id === card.id ? { ...c, isFlipped: true } : c
      )
    );

    onAnnounce(`Card revealed: ${card.content}`, 'cardFlip');

    if (newFlippedCards.length === 2) {
      const firstCard = cards.find(c => c.id === newFlippedCards[0]);
      const secondCard = cards.find(c => c.id === newFlippedCards[1]);

      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              newFlippedCards.includes(c.id) ? { ...c, isMatched: true } : c
            )
          );
          setMatchedPairs(matchedPairs + 1);
          setScore(score + 10);
          setFlippedCards([]);
          
          onAnnounce(`Match found! ${firstCard.content}. ${firstCard.description}. ${matchedPairs + 1} pairs found out of ${totalPairs}.`, 'match');
          
          if (matchedPairs + 1 === totalPairs) {
            setTimeout(() => {
              setGameState('complete');
              onAnnounce(`Congratulations! Game completed in ${moves + 1} moves. Final score: ${score + 10}`, 'victory');
            }, 1000);
          }
        }, 1000);
      } else {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              newFlippedCards.includes(c.id) ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          onAnnounce("No match. Cards flipped back. Try again!", 'noMatch');
        }, 2000);
      }
    }
  }, [cards, currentPosition, flippedCards, level.cols, matchedPairs, moves, score, totalPairs, onAnnounce]);

  // Get position announcement
  const getPositionAnnouncement = useCallback((row: number, col: number) => {
    const cardIndex = row * level.cols + col;
    const card = cards[cardIndex];
    
    if (card) {
      if (card.isMatched) {
        return `Row ${row + 1}, Column ${col + 1}. Matched pair: ${card.content}`;
      } else if (card.isFlipped) {
        return `Row ${row + 1}, Column ${col + 1}. Currently showing: ${card.content}`;
      } else {
        return `Row ${row + 1}, Column ${col + 1}. Hidden card`;
      }
    }
    return `Row ${row + 1}, Column ${col + 1}`;
  }, [cards, level.cols]);

  return {
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
  };
}; 