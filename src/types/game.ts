export interface GameCard {
  id: string;
  content: string;
  description: string;
  emoji: string;
  isFlipped: boolean;
  isMatched: boolean;
}

export interface Level {
  name: string;
  rows: number;
  cols: number;
  description: string;
} 