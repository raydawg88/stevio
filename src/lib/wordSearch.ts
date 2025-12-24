export type Direction = {
  x: number
  y: number
  name: string
}

export type PlacedWord = {
  word: string
  startX: number
  startY: number
  direction: Direction
  cells: { x: number; y: number }[]
}

export type Puzzle = {
  grid: string[][]
  size: number
  words: string[]
  placedWords: PlacedWord[]
}

const DIRECTIONS: Direction[] = [
  { x: 1, y: 0, name: 'horizontal' },
  { x: 0, y: 1, name: 'vertical' },
]

const FILL_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j], result[i]]
  }
  return result
}

function createEmptyGrid(size: number): string[][] {
  return Array(size)
    .fill(null)
    .map(() => Array(size).fill(''))
}

function canPlaceWord(
  grid: string[][],
  word: string,
  startX: number,
  startY: number,
  direction: Direction
): boolean {
  const size = grid.length

  for (let i = 0; i < word.length; i++) {
    const x = startX + i * direction.x
    const y = startY + i * direction.y

    if (x < 0 || x >= size || y < 0 || y >= size) {
      return false
    }

    const currentCell = grid[y][x]
    if (currentCell !== '' && currentCell !== word[i]) {
      return false
    }
  }

  return true
}

function placeWord(
  grid: string[][],
  word: string,
  startX: number,
  startY: number,
  direction: Direction
): PlacedWord {
  const cells: { x: number; y: number }[] = []

  for (let i = 0; i < word.length; i++) {
    const x = startX + i * direction.x
    const y = startY + i * direction.y
    grid[y][x] = word[i]
    cells.push({ x, y })
  }

  return {
    word,
    startX,
    startY,
    direction,
    cells,
  }
}

function tryPlaceWord(
  grid: string[][],
  word: string
): PlacedWord | null {
  const size = grid.length
  const shuffledDirections = shuffle(DIRECTIONS)

  // Try each direction
  for (const direction of shuffledDirections) {
    // Generate all valid starting positions for this direction
    const positions: { x: number; y: number }[] = []

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        positions.push({ x, y })
      }
    }

    const shuffledPositions = shuffle(positions)

    for (const pos of shuffledPositions) {
      if (canPlaceWord(grid, word, pos.x, pos.y, direction)) {
        return placeWord(grid, word, pos.x, pos.y, direction)
      }
    }
  }

  return null
}

function fillEmptyCells(grid: string[][]): void {
  for (let y = 0; y < grid.length; y++) {
    for (let x = 0; x < grid[y].length; x++) {
      if (grid[y][x] === '') {
        grid[y][x] = FILL_LETTERS[Math.floor(Math.random() * FILL_LETTERS.length)]
      }
    }
  }
}

export function generatePuzzle(words: string[], size: number = 12): Puzzle {
  // Normalize words: uppercase, no spaces
  const normalizedWords = words
    .map((w) => w.toUpperCase().replace(/\s/g, ''))
    .filter((w) => w.length > 0 && w.length <= size)
    .sort((a, b) => b.length - a.length) // Place longer words first

  const grid = createEmptyGrid(size)
  const placedWords: PlacedWord[] = []

  for (const word of normalizedWords) {
    const placed = tryPlaceWord(grid, word)
    if (placed) {
      placedWords.push(placed)
    }
  }

  fillEmptyCells(grid)

  return {
    grid,
    size,
    words: placedWords.map((pw) => pw.word),
    placedWords,
  }
}

export function checkWord(
  cells: { x: number; y: number }[],
  placedWords: PlacedWord[]
): PlacedWord | null {
  for (const pw of placedWords) {
    if (pw.cells.length !== cells.length) continue

    // Check forward match
    const forwardMatch = pw.cells.every(
      (cell, i) => cell.x === cells[i].x && cell.y === cells[i].y
    )
    if (forwardMatch) return pw

    // Check reverse match
    const reverseMatch = pw.cells.every(
      (cell, i) =>
        cell.x === cells[cells.length - 1 - i].x &&
        cell.y === cells[cells.length - 1 - i].y
    )
    if (reverseMatch) return pw
  }

  return null
}

// Word categories for themed puzzles
export const WORD_CATEGORIES = {
  classic: [
    'ADVENTURE', 'MYSTERY', 'TREASURE', 'DISCOVERY', 'JOURNEY',
    'EXPLORE', 'WONDER', 'CURIOUS', 'HIDDEN', 'SECRET',
    'PUZZLE', 'QUEST', 'LEGEND', 'ANCIENT', 'WISDOM'
  ],
  nature: [
    'MOUNTAIN', 'FOREST', 'OCEAN', 'RIVER', 'MEADOW',
    'VALLEY', 'CANYON', 'SUNSET', 'SUNRISE', 'HORIZON',
    'BREEZE', 'THUNDER', 'RAINBOW', 'WILDLIFE', 'BLOOM'
  ],
  vintage: [
    'TELEGRAPH', 'GAZETTE', 'JOURNAL', 'HERALD', 'TRIBUNE',
    'CHRONICLE', 'DISPATCH', 'BULLETIN', 'EDITION', 'HEADLINE',
    'COLUMN', 'PRESS', 'INK', 'TYPE', 'PRINT'
  ],
  coffee: [
    'ESPRESSO', 'CAPPUCCINO', 'LATTE', 'MOCHA', 'AMERICANO',
    'ARABICA', 'ROAST', 'BREW', 'STEAM', 'CREAM',
    'BEAN', 'GRIND', 'POUR', 'AROMA', 'SMOOTH'
  ],
}

export function getRandomCategory(): { name: string; words: string[] } {
  const categories = Object.entries(WORD_CATEGORIES)
  const [name, words] = categories[Math.floor(Math.random() * categories.length)]
  return { name, words }
}
