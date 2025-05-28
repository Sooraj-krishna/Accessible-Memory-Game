import { Level } from '@/types/game';

export const levels: Level[] = [
  { name: "Beginner", rows: 2, cols: 2, description: "2 rows, 2 columns - 4 cards total" },
  { name: "Easy", rows: 2, cols: 3, description: "2 rows, 3 columns - 6 cards total" },
  { name: "Intermediate", rows: 3, cols: 4, description: "3 rows, 4 columns - 12 cards total" },
  { name: "Advanced", rows: 4, cols: 4, description: "4 rows, 4 columns - 16 cards total" },
  { name: "Expert", rows: 4, cols: 5, description: "4 rows, 5 columns - 20 cards total" },
  { name: "Master", rows: 5, cols: 6, description: "5 rows, 6 columns - 30 cards total" }
];

export const gameCards = [
  { content: "Lion", description: "The lion is the king of animals, known for its powerful roar and majestic mane", emoji: "🦁" },
  { content: "Elephant", description: "Elephants are gentle giants with excellent memory and strong family bonds", emoji: "🐘" },
  { content: "Tiger", description: "Tigers are powerful striped cats, excellent hunters with incredible strength", emoji: "🐅" },
  { content: "Bear", description: "Bears are strong, intelligent mammals that can stand on their hind legs", emoji: "🐻" },
  { content: "Eagle", description: "Eagles are magnificent birds of prey with excellent eyesight and powerful wings", emoji: "🦅" },
  { content: "Dolphin", description: "Dolphins are intelligent marine mammals known for their playful nature", emoji: "🐬" },
  { content: "Butterfly", description: "Butterflies are beautiful insects that transform from caterpillars", emoji: "🦋" },
  { content: "Owl", description: "Owls are wise nocturnal birds with excellent hearing and silent flight", emoji: "🦉" },
  { content: "Penguin", description: "Penguins are flightless birds that excel at swimming and sliding on ice", emoji: "🐧" },
  { content: "Giraffe", description: "Giraffes are the tallest land animals with long necks to reach high leaves", emoji: "🦒" },
  { content: "Kangaroo", description: "Kangaroos are marsupials that hop and carry their babies in pouches", emoji: "🦘" },
  { content: "Octopus", description: "Octopuses are intelligent sea creatures with eight arms and can change color", emoji: "🐙" },
  { content: "Peacock", description: "Peacocks are colorful birds known for their magnificent tail displays", emoji: "🦚" },
  { content: "Koala", description: "Koalas are tree-dwelling marsupials that mainly eat eucalyptus leaves", emoji: "🐨" },
  { content: "Zebra", description: "Zebras have distinctive black and white stripes, unique to each individual", emoji: "🦓" },
  { content: "Panda", description: "Pandas are black and white bears that primarily eat bamboo", emoji: "🐼" },
  { content: "Rhinoceros", description: "Rhinoceros are powerful animals with distinctive horns on their nose", emoji: "🦏" },
  { content: "Gorilla", description: "Gorillas are intelligent primates that live in family groups called troops", emoji: "🦍" },
  { content: "Flamingo", description: "Flamingos are pink birds that often stand on one leg", emoji: "🦩" },
  { content: "Hedgehog", description: "Hedgehogs are small mammals covered in spikes for protection", emoji: "🦔" },
  { content: "Turtle", description: "Turtles are reptiles with hard shells that can live for many decades", emoji: "🐢" },
  { content: "Parrot", description: "Parrots are colorful birds known for their ability to mimic sounds", emoji: "🦜" },
  { content: "Shark", description: "Sharks are powerful ocean predators with multiple rows of teeth", emoji: "🦈" },
  { content: "Unicorn", description: "Unicorns are magical horses with a single horn on their forehead", emoji: "🦄" },
  { content: "Wolf", description: "Wolves are social animals that live and hunt in packs", emoji: "🐺" }
]; 