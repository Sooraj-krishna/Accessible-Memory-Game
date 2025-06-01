import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { GameCard, Level } from '@/types/game';
import { levels, gameCards } from '@/data/gameData';
import { gameSounds } from '@/lib/generateSounds';

interface UseMemoryGameProps {
  onAnnounce: (message: string, sound?: keyof typeof gameSounds) => void;
}

export const useMemoryGame = ({ onAnnounce }: UseMemoryGameProps) => {
  const [currentLevel, setCurrentLevel] = useState(0);
  const [customLevelData, setCustomLevelData] = useState<Level | null>(null);
  const [gameState, setGameState] = useState<'menu' | 'playing' | 'complete'>('menu');
  const [cards, setCards] = useState<GameCard[]>([]);
  const [flippedCards, setFlippedCards] = useState<string[]>([]);
  const [matchedPairs, setMatchedPairs] = useState(0);
  const [currentPosition, setCurrentPosition] = useState({ row: 0, col: 0 });
  const [score, setScore] = useState(0);
  const [moves, setMoves] = useState(0);
  const shuffledCardsRef = useRef<GameCard[]>([]);
  const gameInitializedRef = useRef(false);

  // Memoize current level and total pairs
  const level = useMemo(() => {
    if (currentLevel === levels.length && customLevelData) {
      return customLevelData;
    }
    return levels[currentLevel];
  }, [currentLevel, customLevelData]);
  const totalPairs = useMemo(() => (level.rows * level.cols) / 2, [level.rows, level.cols]);

  // Generate shuffled cards - only called once at the start
  const generateShuffledCards = useCallback((totalCards: number) => {
    if (shuffledCardsRef.current.length === 0) {
      const selectedCards = gameCards.slice(0, totalCards / 2);
      const duplicatedCards = [...selectedCards, ...selectedCards];
      
      shuffledCardsRef.current = duplicatedCards
        .sort(() => Math.random() - 0.5)
        .map((card, index) => ({
          id: `card-${index}`,
          content: card.content,
          description: card.description,
          emoji: card.emoji,
          isFlipped: false,
          isMatched: false
        }));
    }
    return shuffledCardsRef.current;
  }, []);

  // Initialize game
  const initializeGame = useCallback(() => {
    if (gameInitializedRef.current && gameState === 'playing') {
      return; // Prevent re-initialization if game is already in progress
    }
    const totalCards = level.rows * level.cols;
    shuffledCardsRef.current = [];
    const shuffledCards = generateShuffledCards(totalCards);
    setCards(shuffledCards);
    setFlippedCards([]);
    setMatchedPairs(0);
    setCurrentPosition({ row: 0, col: 0 });
    setScore(0);
    setMoves(0);
    setGameState('playing');
    gameInitializedRef.current = true;
    onAnnounce(
      `Game started! ${level.name} level. Score: 0. Total cards: ${level.rows * level.cols}. Total pairs: ${totalPairs}. Navigate with tab and arrow keys. Current position: Row 1, Column 1.`
    );
  }, [level, generateShuffledCards, onAnnounce, gameState, totalPairs]);

  // Reset game initialization flag when changing levels or completing game
  useEffect(() => {
    if (gameState === 'menu' || gameState === 'complete') {
      gameInitializedRef.current = false;
    }
  }, [gameState]);

  // Handle card selection
  const handleCardSelect = useCallback(() => {
    if (gameState !== 'playing') return;
    const cardIndex = currentPosition.row * level.cols + currentPosition.col;
    const card = cards[cardIndex];
    if (!card || card.isFlipped || card.isMatched || flippedCards.length >= 2) {
      onAnnounce('This card cannot be selected');
      return;
    }
    const newFlippedCards = [...flippedCards, card.id];
    setFlippedCards(newFlippedCards);
    setMoves(prev => prev + 1);
    setCards(prevCards => 
      prevCards.map(c => 
        c.id === card.id ? { ...c, isFlipped: true } : c
      )
    );
    onAnnounce(`Card revealed: ${card.content}, current position: ${currentPosition.row + 1}, ${currentPosition.col + 1}`, 'cardFlip');
    if (newFlippedCards.length === 2) {
      const firstCard = cards.find(c => c.id === newFlippedCards[0]);
      const secondCard = cards.find(c => c.id === newFlippedCards[1]);
      if (firstCard && secondCard && firstCard.content === secondCard.content) {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              newFlippedCards.includes(c.id) ? { ...c, isMatched: true, isFlipped: true } : c
            )
          );
          const newMatchedPairs = matchedPairs + 1;
          setMatchedPairs(newMatchedPairs);
          setScore(prev => prev + 10);
          setFlippedCards([]);
          onAnnounce(`Match found! ${firstCard.content}. ${firstCard.description}. ${newMatchedPairs} pairs found out of ${totalPairs}.`, 'match');
          if (newMatchedPairs === totalPairs) {
            setTimeout(() => {
              setGameState('complete');
              gameInitializedRef.current = false;
              onAnnounce(`Congratulations! Game completed in ${moves + 1} moves. Final score: ${score + 10}, Press control + enter to play again, or press control + m to return to the menu`, 'victory');
            }, 1000);
          }
        }, 1000);
      } else {
        setTimeout(() => {
          setCards(prevCards => 
            prevCards.map(c => 
              newFlippedCards.includes(c.id) && !c.isMatched ? { ...c, isFlipped: false } : c
            )
          );
          setFlippedCards([]);
          onAnnounce("No match. Cards flipped back. Try again!", 'noMatch');
        }, 2000);
      }
    }
  }, [cards, currentPosition, flippedCards, level.cols, matchedPairs, moves, score, totalPairs, onAnnounce, gameState]);

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
    customLevelData,
    setCustomLevelData,
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