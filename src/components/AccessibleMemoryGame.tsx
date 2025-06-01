import React, { useRef, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { gameSounds } from '@/lib/generateSounds';
import { useMemoryGame } from '@/hooks/useMemoryGame';
import { levels } from '@/data/gameData';
import { CustomLevelDialog } from '@/components/ui/custom-level-dialog';

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

// Add theme type definition
type Theme = 'attractive' | 'high-contrast';

// Add theme styles
const themeStyles = {
  attractive: {
    background: 'bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200',
    card: 'bg-white/80 backdrop-blur-sm',
    cardHover: 'hover:scale-105 hover:-rotate-2 transition-transform duration-300 ease-in-out',
    text: 'text-gray-700',
    heading: 'bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent',
    button: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
    buttonOutline: 'bg-white/80 hover:bg-purple-100',
    statsCard: 'bg-gradient-to-br from-purple-100 to-purple-200',
    completionCard: 'bg-white/90 backdrop-blur-sm',
    matchedCard: '[background:oklch(87.1%_0.15_154.449)]',
    selectedCard: '[background:oklch(70.7%_0.165_254.624)]'
  },
  'high-contrast': {
    background: 'bg-black',
    card: 'bg-black border-4 border-yellow-400',
    cardHover: 'hover:border-yellow-200 hover:scale-105 hover:-rotate-2 transition-transform duration-300 ease-in-out',
    text: 'text-yellow-400',
    heading: 'text-yellow-400',
    button: 'bg-yellow-400 text-black hover:bg-yellow-300',
    buttonOutline: 'bg-black border-4 border-yellow-400 text-yellow-400 hover:bg-yellow-400 hover:text-black',
    statsCard: 'bg-black border-4 border-yellow-400',
    completionCard: 'bg-black border-4 border-yellow-400',
    matchedCard: '[background:oklch(87.1%_0.15_154.449)_opacity(0.2)] border-green-400',
    selectedCard: '[background:oklch(70.7%_0.165_254.624)_opacity(0.2)] border-blue-400'
  }
};
// Add keyboard event handler type
type KeyboardEventHandler = (e: React.KeyboardEvent) => void;

// Add this type at the top of the file with other interfaces
interface GridStyles {
  mobile: string;
  tablet: string;
  desktop: string;
}

// Add this function to generate grid styles
const getGridStyles = (cols: number): GridStyles => ({
  mobile: `repeat(${cols}, minmax(35px, 1fr))`,
  tablet: `repeat(${cols}, minmax(70px, 1fr))`,
  desktop: `repeat(${cols}, minmax(90px, 1fr))`
});

// Memoized game card component
const GameCard = React.memo(({ 
  card, 
  row, 
  col, 
  isCurrentPosition, 
  onCardClick,
  onCardFlip,
  level,
  theme
}: {
  card: GameCard;
  row: number;
  col: number;
  isCurrentPosition: boolean;
  onCardClick: () => void;
  onCardFlip: () => void;
  level: Level;
  theme: Theme;
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [lastClickTime, setLastClickTime] = useState<number>(0);

  const handleClick = () => {
    const currentTime = new Date().getTime();
    const timeDiff = currentTime - lastClickTime;

    if (isCurrentPosition && timeDiff < 300) {
      onCardFlip();
    } else {
      onCardClick();
    }

    setLastClickTime(currentTime);
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 transform h-full
        ${themeStyles[theme].cardHover}
        ${isCurrentPosition ? 'ring-4 ring-yellow-400 animate-pulse' : ''} 
        ${card.isMatched ? `${themeStyles[theme].card} ${themeStyles[theme].matchedCard} rotate-3` : ''} 
        ${card.isFlipped && !card.isMatched ? `${themeStyles[theme].card} ${themeStyles[theme].selectedCard} -rotate-3` : ''} 
        ${isHovered ? 'scale-110 shadow-2xl' : 'shadow-lg'}
        hover:shadow-xl`}
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
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
          <div className="text-center animate-fadeIn">
            <div className={`text-2xl sm:text-2xl xs:text-xl mb-1 ${theme === 'attractive' ? 'text-gray-800' : ''}`}>{card.emoji}</div>
            <div className={`text-[10px] sm:text-xs font-medium ${themeStyles[theme].text} ${theme === 'attractive' ? 'text-gray-800' : ''}`}>{card.content}</div>
          </div>
        ) : (
          <div className={`w-full h-full ${themeStyles[theme].card} rounded flex items-center justify-center`}>
            <span className="text-xl sm:text-2xl">❓</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
});

GameCard.displayName = 'GameCard';

// Update ThemeToggle component
const ThemeToggle = React.memo(({ theme, setTheme, className = '' }: { 
  theme: Theme; 
  setTheme: React.Dispatch<React.SetStateAction<Theme>>;
  className?: string;
}) => {
  const handleKeyDown: KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setTheme(prev => prev === 'attractive' ? 'high-contrast' : 'attractive');
    }
  };

  return (
    <Button 
      onClick={() => setTheme(prev => prev === 'attractive' ? 'high-contrast' : 'attractive')}
      onKeyDown={handleKeyDown}
      variant="outline"
      size="sm"
      className={`${themeStyles[theme].buttonOutline} transition-colors text-sm sm:text-base whitespace-nowrap ${className}`}
      aria-label={`Switch to ${theme === 'attractive' ? 'high contrast' : 'attractive'} theme`}
      role="button"
      tabIndex={0}
    >
      {theme === 'attractive' ? (
        <div className="flex items-center gap-1 sm:gap-2">
          <span role="img" aria-hidden="true">👁️</span>
          <span className="hidden xs:inline">High Contrast</span>
        </div>
      ) : (
        <div className="flex items-center gap-1 sm:gap-2">
          <span role="img" aria-hidden="true">🎨</span>
          <span className="hidden xs:inline">Attractive</span>
        </div>
      )}
    </Button>
  );
});

ThemeToggle.displayName = 'ThemeToggle';

// Update HelpMenu with keyboard support
const HelpMenu = React.memo(({ onClose, theme, announce }: { onClose: () => void; theme: Theme; announce: (msg: string) => void }) => {
  const handleCloseKeyDown: KeyboardEventHandler = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClose();
    }
  };

  // Announce all shortcuts when help menu opens
  React.useEffect(() => {
    announce(
      'Keyboard shortcuts: Ctrl and Alt and N to start new game, Ctrl and M to return to main menu, Ctrl and H to show or hide help, Ctrl and S to toggle sound, Ctrl and Alt and C to create custom level in menu, Ctrl and P to announce progress, Ctrl and R to announce current position, Ctrl and Enter to start game or play again, Ctrl and Alt and T to change theme, Escape to return to main menu.'
    );
  }, [announce]);

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-label="Keyboard shortcuts help menu"
    >
      <Card className={themeStyles[theme].card}>
        <CardContent className="p-6">
          <h2 className={`text-2xl font-bold mb-4 ${themeStyles[theme].heading}`}>Keyboard Shortcuts</h2>
          <div className={`space-y-2 ${themeStyles[theme].text}`}>
            <p>⬆️ ⬇️ ⬅️ ➡️ Arrow keys: Navigate through cards in the game grid</p>
            <p>Tab: Navigate through buttons and controls</p>
            <p>Space or Enter: Select/flip a card or activate a button</p>
            <p>Ctrl + Alt + N: Start new game (restart current level)</p>
            <p>Ctrl + Enter: Start game (main menu) / Play again (completion)</p>
            <p>Ctrl + M: Return to main menu / Choose another level (completion)</p>
            <p>Ctrl + H: Show/hide help</p>
            <p>Ctrl + S: Toggle sound</p>
            <p>Ctrl + Alt + T: Change theme</p>
            <p>Ctrl + Alt + C: Create custom level (in menu)</p>
            <p>Ctrl + P: Announce progress</p>
            <p>Ctrl + R: Announce current position</p>
            <p>Escape: Return to main menu</p>
          </div>
          <Button 
            onClick={onClose}
            onKeyDown={handleCloseKeyDown}
            className={`mt-4 w-full ${themeStyles[theme].button}`}
            aria-label="Close help menu"
            role="button"
            tabIndex={0}
          >
            Close Help (Press H)
          </Button>
        </CardContent>
      </Card>
    </div>
  );
});

HelpMenu.displayName = 'HelpMenu';

export const AccessibleMemoryGame = () => {
  const announcementRef = useRef<HTMLDivElement>(null);
  const initialLoadRef = useRef(true);
  const [isSoundEnabled, setIsSoundEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [theme, setTheme] = useState<Theme>('attractive');
  const [showCustomLevelDialog, setShowCustomLevelDialog] = useState(false);
  const [isFirstMount, setIsFirstMount] = useState(true);

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
  } = useMemoryGame({ onAnnounce: announce });

  // // Initial game announcement
  // useEffect(() => {
  //   if (isFirstMount && gameState === 'menu') {
  //     setTimeout(() => {
  //       announce(
  //         `Accessible Memory Game. An exciting memory game designed for kids! Instructions: Use arrow keys to navigate through cards, Space or Enter to select cards, and Tab key to navigate through buttons and controls.`
  //       );
  //       setIsFirstMount(false);
  //     }, 500);
  //   }
  // }, [isFirstMount, gameState, announce]);


  // Add effect to initialize game when loading is complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
       if (gameState === 'menu') {
         announce(
           `Accessible Memory Game. An exciting memory game designed for kids! Instructions: Use arrow keys to navigate through cards, Space or Enter to select cards, and Tab key to navigate through buttons and controls.`
         );
       }
     }, 1000);
     return () => clearTimeout(timer);
  }, [gameState, announce]);

  // Add custom level card
  const handleCustomLevel = (rows: number, cols: number) => {
    const newCustomLevel: Level = {
      name: "Custom Level",
      rows,
      cols,
      description: `${rows}×${cols} grid - ${rows * cols} cards total`
    };
    setCustomLevelData(newCustomLevel);
    setCurrentLevel(levels.length);
    setShowCustomLevelDialog(false);
    setGameState('playing');
  };

  // Update the menu's start game button handler
  const handleStartGame = () => {
    if (currentLevel === levels.length && !customLevelData) {
      setShowCustomLevelDialog(true);
    } else {
      setGameState('playing');
    }
  };

  // Add effect to initialize game when loading is complete
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (gameState === 'playing') {
        initializeGame();
      }
    }, 2000);
    return () => clearTimeout(timer);
  }, [gameState, initializeGame]);

  // Add effect to initialize game when starting from menu
  useEffect(() => {
    if (gameState === 'playing' && cards.length === 0) {
      initializeGame();
    }
  }, [gameState, cards.length, initializeGame]);

  // Close help menu when game state changes to menu or playing
  useEffect(() => {
    if (gameState === 'menu' || gameState === 'playing') {
      setShowHelp(false);
    }
  }, [gameState]);

  // Add keyboard navigation handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+Alt key shortcuts
      if (e.ctrlKey && e.altKey) {
        switch (e.key.toLowerCase()) {
          case 'n': // Ctrl+Alt+N: New game
            e.preventDefault();
            if (gameState === 'playing' || gameState === 'complete') {
              initializeGame();
            }
            break;
          case 't': // Ctrl+Alt+T: Theme
            e.preventDefault();
            setTheme(prev => prev === 'attractive' ? 'high-contrast' : 'attractive');
            break;
          case 'c': // Ctrl+Alt+C: Custom level (only in menu)
            e.preventDefault();
            if (gameState === 'menu') setShowCustomLevelDialog(true);
            break;
          default:
            break;
        }
        return;
      }
      // Ctrl key shortcuts (no alt)
      if (e.ctrlKey) {
        switch (e.key.toLowerCase()) {
          case 'm': // Ctrl+M: Main menu or choose another level
            e.preventDefault();
            if (gameState === 'complete') {
              setGameState('menu');
            } else {
              setGameState('menu');
            }
            break;
          case 'h': // Ctrl+H: Help
            e.preventDefault();
            setShowHelp(prev => !prev);
            break;
          case 's': // Ctrl+S: Sound
            e.preventDefault();
            setIsSoundEnabled(prev => !prev);
            break;
          case 'p': // Ctrl+P: Announce progress
            e.preventDefault();
            announce(`Score: ${score}, Moves: ${moves}, Pairs: ${matchedPairs} of ${totalPairs}`);
            break;
          case 'r': // Ctrl+R: Announce current position
            e.preventDefault();
            announce(getPositionAnnouncement(currentPosition.row, currentPosition.col));
            break;
          case 'enter': // Ctrl+Enter: Start game or play again
            e.preventDefault();
            if (gameState === 'menu') {
              handleStartGame();
            } else if (gameState === 'complete') {
              initializeGame();
            }
            break;
          default:
            break;
        }
        return;
      }
      // Regular shortcuts
      if (gameState !== 'playing') return;
      switch (e.key) {
        case 'ArrowUp':
          e.preventDefault();
          setCurrentPosition(prev => {
            const newRow = Math.max(0, prev.row - 1);
            const cardIndex = newRow * level.cols + prev.col;
            const card = cards[cardIndex];
            const status = card.isMatched ? 'Matched' : card.isFlipped ? `Showing: ${card.content}` : 'Hidden card';
            announce(`Row ${newRow + 1}, Column ${prev.col + 1}. ${status}`);
            return { row: newRow, col: prev.col };
          });
          break;
        case 'ArrowDown':
          e.preventDefault();
          setCurrentPosition(prev => {
            const newRow = Math.min(level.rows - 1, prev.row + 1);
            const cardIndex = newRow * level.cols + prev.col;
            const card = cards[cardIndex];
            const status = card.isMatched ? 'Matched' : card.isFlipped ? `Showing: ${card.content}` : 'Hidden card';
            announce(`Row ${newRow + 1}, Column ${prev.col + 1}. ${status}`);
            return { row: newRow, col: prev.col };
          });
          break;
        case 'ArrowLeft':
          e.preventDefault();
          setCurrentPosition(prev => {
            const newCol = Math.max(0, prev.col - 1);
            const cardIndex = prev.row * level.cols + newCol;
            const card = cards[cardIndex];
            const status = card.isMatched ? 'Matched' : card.isFlipped ? `Showing: ${card.content}` : 'Hidden card';
            announce(`Row ${prev.row + 1}, Column ${newCol + 1}. ${status}`);
            return { row: prev.row, col: newCol };
          });
          break;
        case 'ArrowRight':
          e.preventDefault();
          setCurrentPosition(prev => {
            const newCol = Math.min(level.cols - 1, prev.col + 1);
            const cardIndex = prev.row * level.cols + newCol;
            const card = cards[cardIndex];
            const status = card.isMatched ? 'Matched' : card.isFlipped ? `Showing: ${card.content}` : 'Hidden card';
            announce(`Row ${prev.row + 1}, Column ${newCol + 1}. ${status}`);
            return { row: prev.row, col: newCol };
          });
          break;
        case 'Tab':
          // Remove Tab key handling for cards - let it handle button navigation naturally
          break;
        case ' ':
        case 'Enter':
        case 'space':
          e.preventDefault();
          handleCardSelect();
          break;
        case 'h':
        case 'H':
          setShowHelp(prev => !prev);
          break;
        case 'm':
        case 'M':
          setIsSoundEnabled(prev => !prev);
          break;
        case 'Escape':
          setGameState('menu');
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState, level, currentPosition, handleCardSelect, setGameState, initializeGame, setIsSoundEnabled, setShowHelp, announce, score, moves, matchedPairs, totalPairs, getPositionAnnouncement, setTheme, handleStartGame]);

  // Announce game name, description, instructions when first entering the menu
  useEffect(() => {
    if (gameState === 'menu') {
      if (initialLoadRef.current) {
        announce(
          `Accessible Memory Game. An exciting memory game designed for kids! Instructions: Use arrow keys to navigate through cards, Space or Enter to select cards, and Tab key to navigate through buttons and controls.`
        );
        initialLoadRef.current = false;
      }
    }
  }, [gameState, announce]);

  // Announce game start information once
  useEffect(() => {
    if (gameState === 'playing' && cards.length > 0) {
      announce(
        `Starting ${level.name} level. Score: ${score}, Moves: ${moves}, Find ${totalPairs} pairs out of ${cards.length} cards.`
      );
    }
  }, [gameState, cards.length]); // Only trigger on game state change and when cards are loaded

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-200 via-pink-200 to-blue-200 flex items-center justify-center">
        <div className="text-center">
          <img 
            src="/favicon.ico" 
            alt="Memory Game Icon" 
            className="w-24 h-24 mx-auto mb-8 animate-bounce"
            style={{ animationDuration: '2s' }}
          />
          <h1 className="text-4xl md:text-6xl font-bold mb-8 bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent animate-bounce">
            Accessible Memory Game! 🎮
          </h1>
          <div className="flex gap-4 justify-center mb-6">
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.1s" }}>🎯</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.2s" }}>🎨</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.3s" }}>🎪</span>
            <span className="text-4xl animate-bounce" style={{ animationDelay: "0.4s" }}>🎭</span>
          </div>
          <div className="w-64 h-2 bg-white/50 rounded-full mx-auto overflow-hidden">
            <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 animate-pulse rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'menu') {
    return (
      <div className={`min-h-screen ${themeStyles[theme].background} p-4`}>
        {showCustomLevelDialog && (
          <CustomLevelDialog
            isOpen={showCustomLevelDialog}
            onClose={() => setShowCustomLevelDialog(false)}
            onSubmit={handleCustomLevel}
            theme={theme}
          />
        )}
        <div 
          ref={announcementRef}
          aria-live="polite"
          className="sr-only"
          role="status"
        />
        
        {/* Update theme toggle positioning */}
        <div className="fixed top-2 right-2 sm:top-4 sm:right-4 z-50">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
        
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className={`text-5xl md:text-7xl font-bold mb-6 animate-float ${themeStyles[theme].heading}`}>
              Memory Game
              <span className="inline-block animate-bounce ml-2">🎮</span>
            </h1>
            <p className={`text-xl ${themeStyles[theme].text} mb-4 animate-fadeIn`}>
              An exciting memory game designed for kids! 🌟
            </p>
            <p className={`text-lg ${themeStyles[theme].text} ${themeStyles[theme].card} rounded-full px-6 py-2 inline-block shadow-lg`}>
              Use arrow keys to navigate, Space or Enter to select cards ✨
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 mb-12">
            {levels.map((levelInfo, index) => (
              <Card 
                key={index}
                className={`cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-rotate-3
                  ${currentLevel === index ? `ring-4 ${theme === 'high-contrast' ? 'ring-yellow-400' : 'ring-purple-400'} ${themeStyles[theme].card}` : themeStyles[theme].card} 
                  shadow-xl hover:shadow-2xl`}
                onClick={() => {
                  setCurrentLevel(index);
                  setCustomLevelData(null);
                  announce(`${levelInfo.name} level selected`);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    setCurrentLevel(index);
                    setCustomLevelData(null);
                    announce(`${levelInfo.name} level selected`);
                  }
                }}
                tabIndex={0}
                role="button"
                aria-label={`Select ${levelInfo.name} level. ${levelInfo.description}`}
              >
                <CardContent className="p-6 text-center">
                  <div className="text-3xl mb-3 animate-float">
                    {index === 0 ? '🌱' : index === 1 ? '🌟' : '🏆'}
                  </div>
                  <h3 className={`text-2xl font-bold mb-2 ${themeStyles[theme].heading}`}>{levelInfo.name}</h3>
                  <p className={`${themeStyles[theme].text} mb-4`}>{levelInfo.description}</p>
                  <Badge 
                    variant={currentLevel === index ? "default" : "secondary"}
                    className={`animate-pulse ${theme === 'high-contrast' ? 'bg-yellow-400 text-black' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                  >
                    {levelInfo.rows}×{levelInfo.cols} Grid
                  </Badge>
                </CardContent>
              </Card>
            ))}
            {/* Custom Level Card */}
            <Card
              className={`cursor-pointer transition-all duration-300 transform hover:scale-105 hover:-rotate-3
                ${currentLevel === levels.length ? `ring-4 ${theme === 'high-contrast' ? 'ring-yellow-400' : 'ring-purple-400'} ${themeStyles[theme].card}` : themeStyles[theme].card} 
                shadow-xl hover:shadow-2xl`}
              onClick={() => setShowCustomLevelDialog(true)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  setShowCustomLevelDialog(true);
                }
              }}
              tabIndex={0}
              role="button"
              aria-label="Create custom level"
            >
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-3 animate-float">🎨</div>
                <h3 className={`text-2xl font-bold mb-2 ${themeStyles[theme].heading}`}>Custom Grid</h3>
                <p className={`${themeStyles[theme].text} mb-4`}>Create your own custom grid size</p>
                {customLevelData ? (
                  <Badge 
                    variant={currentLevel === levels.length ? "default" : "secondary"}
                    className={`animate-pulse ${theme === 'high-contrast' ? 'bg-yellow-400 text-black' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                  >
                    {customLevelData.rows}×{customLevelData.cols} Grid
                  </Badge>
                ) : (
                  <Badge 
                    variant="secondary"
                    className={`animate-pulse ${theme === 'high-contrast' ? 'bg-yellow-400 text-black' : 'bg-gradient-to-r from-purple-500 to-pink-500'}`}
                  >
                    Customize Grid
                  </Badge>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="text-center">
            <Button 
              onClick={handleStartGame}
              size="lg"
              className={`text-lg px-12 py-6 ${themeStyles[theme].button}
                transform transition-all duration-300 ${themeStyles[theme].cardHover} shadow-xl hover:shadow-2xl`}
              aria-label={`Start ${currentLevel === levels.length ? 'custom' : levels[currentLevel].name} level game`}
            >
              <span className="mr-2">Start Game</span>
              <span className="animate-bounce inline-block">🚀</span>
            </Button>
          </div>

          <div className="mt-12 text-center">
            <div className={`inline-flex gap-4 ${themeStyles[theme].card} rounded-full px-6 py-3 shadow-lg`}>
              <span className="animate-float" style={{ animationDelay: "0s" }}>🎯</span>
              <span className="animate-float" style={{ animationDelay: "0.2s" }}>🎨</span>
              <span className="animate-float" style={{ animationDelay: "0.4s" }}>🎪</span>
              <span className="animate-float" style={{ animationDelay: "0.6s" }}>🎭</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (gameState === 'complete') {
    return (
      <div className={`min-h-screen ${themeStyles[theme].background} p-4 flex items-center justify-center`}>
        <div 
          ref={announcementRef}
          aria-live="polite"
          className="sr-only"
          role="status"
        />
        
        {/* Add theme toggle to top right */}
        <div className="absolute top-4 right-4">
          <ThemeToggle theme={theme} setTheme={setTheme} />
        </div>
        
        <div className="max-w-2xl w-full mx-auto">
          <Card className={`${themeStyles[theme].completionCard} shadow-2xl transform ${themeStyles[theme].cardHover} transition-all duration-500`}>
            <CardContent className="p-8 text-center relative overflow-hidden">
              {/* Floating emojis background */}
              <div className="absolute inset-0 pointer-events-none">
                <span className="absolute top-4 left-4 text-4xl animate-float" style={{ animationDelay: "0s" }}>🎯</span>
                <span className="absolute top-4 right-4 text-4xl animate-float" style={{ animationDelay: "0.3s" }}>🎨</span>
                <span className="absolute bottom-4 left-4 text-4xl animate-float" style={{ animationDelay: "0.6s" }}>🎪</span>
                <span className="absolute bottom-4 right-4 text-4xl animate-float" style={{ animationDelay: "0.9s" }}>🎭</span>
              </div>

              {/* Main content */}
              <div className="relative z-10">
                <div className="text-6xl mb-4 animate-bounce">🎉</div>
                <h2 className={`text-4xl font-bold mb-4 ${themeStyles[theme].heading}`}>
                  Congratulations!
                </h2>
                <p className={`text-lg ${themeStyles[theme].text} mb-6`}>
                  You've completed the {level.name} level with a score of {score} and {moves} moves.
                </p>
                <div className="flex justify-center gap-4">
                  <Button 
                    onClick={initializeGame}
                    className={`${themeStyles[theme].button} transition-colors`}
                    aria-label={`Play ${level.name} level again, press Control + Enter`}
                  >
                    Play Again (Ctrl + Enter)
                  </Button>
                  <Button 
                    onClick={() => setGameState('menu')}
                    variant="outline"
                    className={`${themeStyles[theme].buttonOutline} transition-colors`}
                    aria-label="Return to main menu, press Control + M"
                  >
                    Choose Another Level (Ctrl + M)
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen ${themeStyles[theme].background} p-4`}>
      <div 
        ref={announcementRef}
        aria-live="polite"
        className="sr-only"
        role="status"
      />
      
      {showHelp && <HelpMenu onClose={() => setShowHelp(false)} theme={theme} announce={announce} />}
      
      <div className="max-w-7xl mx-auto">
        {/* Game Header */}
        <div className="flex flex-wrap justify-between items-center mb-6 bg-white/80 rounded-xl p-2 sm:p-4 shadow-lg backdrop-blur-sm">
          <div className="mb-2 sm:mb-0">
            <h2 className={`text-xl sm:text-2xl font-bold ${themeStyles[theme].heading}`}>
              {level.name} Level
            </h2>
            <p className={`text-sm sm:text-base ${themeStyles[theme].text}`}>
              <span className={theme === 'high-contrast' ? 'text-yellow-400' : 'text-purple-600'}>Score: {score}</span> | 
              <span className={theme === 'high-contrast' ? 'text-yellow-400' : 'text-pink-600'}> Moves: {moves}</span> | 
              <span className={theme === 'high-contrast' ? 'text-yellow-400' : 'text-blue-600'}> Pairs: {matchedPairs}/{totalPairs}</span>
            </p>
          </div>
          <div className="flex flex-wrap gap-1 sm:gap-2">
            <ThemeToggle theme={theme} setTheme={setTheme} />
            <Button 
              onClick={() => setIsSoundEnabled(!isSoundEnabled)}
              variant="outline"
              size="sm"
              className={`${themeStyles[theme].buttonOutline} transition-colors`}
              aria-label={`${isSoundEnabled ? 'Disable' : 'Enable'} sound effects`}
            >
              {isSoundEnabled ? '🔊' : '🔇'}
            </Button>
            <Button 
              onClick={() => setShowHelp(true)}
              variant="outline"
              size="sm"
              className={`${themeStyles[theme].buttonOutline} transition-colors`}
              aria-label="Show keyboard shortcuts"
            >
              ❓
            </Button>
            <Button 
              onClick={() => setGameState('menu')}
              variant="outline"
              size="sm"
              className={`${themeStyles[theme].buttonOutline} transition-colors whitespace-nowrap`}
              aria-label="Return to main menu"
            >
              Menu
            </Button>
          </div>
        </div>

        {/* Game Instructions */}
        <div className={`mb-6 p-4 ${themeStyles[theme].card} rounded-xl shadow-lg border-2 ${theme === 'high-contrast' ? 'border-yellow-400' : 'border-purple-200'}`}>
          <p className={`text-sm ${themeStyles[theme].text} font-medium`}>
            <span className={`${theme === 'high-contrast' ? 'text-yellow-400' : 'text-purple-600'} font-bold`}>
              Instructions:
            </span> 
            Use tab and arrow keys to navigate the grid. Press Enter or Space to select a card. 
            Find matching pairs to win! 🎮 ✨
          </p>
        </div>

        {/* Game Grid Container */}
        <div className="w-full overflow-x-auto overflow-y-auto pb-4">
          <style>
            {`
              @media (max-width: 639px) {
                .memory-grid {
                  grid-template-columns: ${getGridStyles(level.cols).mobile} !important;
                }
              }
              @media (min-width: 640px) and (max-width: 1023px) {
                .memory-grid {
                  grid-template-columns: ${getGridStyles(level.cols).tablet} !important;
                }
              }
              @media (min-width: 1024px) {
                .memory-grid {
                  grid-template-columns: ${getGridStyles(level.cols).desktop} !important;
                }
              }
            `}
          </style>
          <div 
            className={`
              memory-grid
              grid auto-rows-auto gap-2 sm:gap-4 mx-auto p-3 sm:p-6 
              ${themeStyles[theme].card} rounded-xl shadow-lg
            `}
            style={{ 
              gap: '0.5rem',
              width: 'fit-content',
              margin: '0 auto'
            }}
            role="grid"
            aria-label={`Memory game grid, ${level.rows} rows by ${level.cols} columns`}
          >
            {cards.map((card, index) => {
              const row = Math.floor(index / level.cols);
              const col = index % level.cols;
              const isCurrentPosition = row === currentPosition.row && col === currentPosition.col;
              
              return (
                <div key={card.id} className="aspect-square w-full">
                  <GameCard
                    card={card}
                    row={row}
                    col={col}
                    isCurrentPosition={isCurrentPosition}
                    onCardClick={() => {
                      setCurrentPosition({ row, col });
                    }}
                    onCardFlip={() => {
                      if (!card.isMatched) {
                        handleCardSelect();
                      }
                    }}
                    level={level}
                    theme={theme}
                  />
                </div>
              );
            })}
          </div>
        </div>

        {/* Current Position Indicator */}
        <div className="mt-6 text-center">
          <p className={`${themeStyles[theme].text} font-medium ${themeStyles[theme].card} inline-block px-4 py-2 rounded-full shadow-md`}>
            Current position: Row {currentPosition.row + 1}, Column {currentPosition.col + 1}
          </p>
        </div>
      </div>
    </div>
  );
};

export default React.memo(AccessibleMemoryGame);