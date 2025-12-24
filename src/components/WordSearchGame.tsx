'use client'

import { useState, useCallback, useEffect } from 'react'
import {
  generatePuzzle,
  checkWord,
  getRandomCategory,
  type Puzzle,
  type PlacedWord,
} from '@/lib/wordSearch'

type CellState = {
  letter: string
  x: number
  y: number
  isSelected: boolean
  isFound: boolean
  foundWordIndex?: number
}

export default function WordSearchGame() {
  const [puzzle, setPuzzle] = useState<Puzzle | null>(null)
  const [categoryName, setCategoryName] = useState('')
  const [cells, setCells] = useState<CellState[][]>([])
  const [selectedCells, setSelectedCells] = useState<{ x: number; y: number }[]>([])
  const [foundWords, setFoundWords] = useState<Set<string>>(new Set())
  const [isSelecting, setIsSelecting] = useState(false)
  const [showWin, setShowWin] = useState(false)

  const initGame = useCallback(() => {
    const category = getRandomCategory()
    const shuffledWords = [...category.words].sort(() => Math.random() - 0.5).slice(0, 8)
    const newPuzzle = generatePuzzle(shuffledWords, 12)

    setCategoryName(category.name)
    setPuzzle(newPuzzle)
    setFoundWords(new Set())
    setSelectedCells([])
    setShowWin(false)

    setCells(
      newPuzzle.grid.map((row, y) =>
        row.map((letter, x) => ({
          letter,
          x,
          y,
          isSelected: false,
          isFound: false,
        }))
      )
    )
  }, [])

  useEffect(() => {
    initGame()
  }, [initGame])

  const getCellKey = (x: number, y: number) => `${x}-${y}`

  const isValidSelection = (newX: number, newY: number): boolean => {
    if (selectedCells.length === 0) return true

    const first = selectedCells[0]
    const last = selectedCells[selectedCells.length - 1]

    // Check if already selected
    if (selectedCells.some((c) => c.x === newX && c.y === newY)) return false

    // Must be adjacent to last selected
    const dx = Math.abs(newX - last.x)
    const dy = Math.abs(newY - last.y)
    if (dx > 1 || dy > 1) return false

    // Must maintain consistent direction
    if (selectedCells.length >= 2) {
      const dirX = last.x - first.x
      const dirY = last.y - first.y

      // Normalize direction
      const normX = dirX === 0 ? 0 : dirX / Math.abs(dirX)
      const normY = dirY === 0 ? 0 : dirY / Math.abs(dirY)

      const newDirX = newX - last.x
      const newDirY = newY - last.y

      if (newDirX !== normX || newDirY !== normY) return false
    }

    return true
  }

  const handleCellMouseDown = (x: number, y: number) => {
    setIsSelecting(true)
    setSelectedCells([{ x, y }])
    setCells((prev) =>
      prev.map((row, cy) =>
        row.map((cell, cx) => ({
          ...cell,
          isSelected: cx === x && cy === y,
        }))
      )
    )
  }

  const handleCellMouseEnter = (x: number, y: number) => {
    if (!isSelecting) return
    if (!isValidSelection(x, y)) return

    setSelectedCells((prev) => [...prev, { x, y }])
    setCells((prev) =>
      prev.map((row, cy) =>
        row.map((cell, cx) => ({
          ...cell,
          isSelected:
            cell.isSelected || (cx === x && cy === y),
        }))
      )
    )
  }

  const handleMouseUp = () => {
    if (!isSelecting || !puzzle) {
      setIsSelecting(false)
      return
    }

    // Check if selection matches a word
    const matchedWord = checkWord(selectedCells, puzzle.placedWords)

    if (matchedWord && !foundWords.has(matchedWord.word)) {
      const newFoundWords = new Set(foundWords)
      newFoundWords.add(matchedWord.word)
      setFoundWords(newFoundWords)

      // Mark cells as found
      setCells((prev) =>
        prev.map((row, cy) =>
          row.map((cell, cx) => {
            const isPartOfWord = matchedWord.cells.some(
              (c) => c.x === cx && c.y === cy
            )
            return {
              ...cell,
              isSelected: false,
              isFound: cell.isFound || isPartOfWord,
            }
          })
        )
      )

      // Check for win
      if (newFoundWords.size === puzzle.words.length) {
        setTimeout(() => setShowWin(true), 500)
      }
    } else {
      // Clear selection
      setCells((prev) =>
        prev.map((row) =>
          row.map((cell) => ({
            ...cell,
            isSelected: false,
          }))
        )
      )
    }

    setSelectedCells([])
    setIsSelecting(false)
  }

  const formatDate = () => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const now = new Date()
    return `${days[now.getDay()]}, ${months[now.getMonth()]} ${now.getDate()}, ${now.getFullYear()}`
  }

  if (!puzzle) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="font-display text-xl">Preparing today&apos;s puzzle...</p>
      </div>
    )
  }

  return (
    <div
      className="min-h-screen py-6 px-4 md:py-10 md:px-8"
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <div className="max-w-4xl mx-auto">
        {/* Masthead */}
        <header className="masthead text-center mb-6">
          <p className="font-body text-xs md:text-sm tracking-widest uppercase text-ink-faded">
            Est. 2024 &bull; A Digital Amusement
          </p>
          <h1 className="font-display text-5xl md:text-7xl font-bold tracking-tight mt-1">
            STEVIO
          </h1>
          <p className="font-display text-lg md:text-xl italic text-ink-light mt-1">
            The Daily Word Search
          </p>
          <div className="flex items-center justify-center gap-4 mt-3 text-xs md:text-sm font-body">
            <span>{formatDate()}</span>
            <span className="text-ink-faded">&bull;</span>
            <span className="uppercase tracking-wide">{categoryName} Edition</span>
            <span className="text-ink-faded">&bull;</span>
            <span>Vol. I, No. {Math.floor(Math.random() * 999) + 1}</span>
          </div>
        </header>

        <hr className="section-rule thick" />

        {/* Main content area */}
        <div className="grid md:grid-cols-3 gap-6 mt-6">
          {/* Puzzle Grid */}
          <div className="md:col-span-2">
            <h2 className="font-display text-xl md:text-2xl font-semibold mb-4 text-center">
              Today&apos;s Puzzle
            </h2>
            <div
              className="inline-block border-2 border-ink p-2 bg-paper-dark/30 select-none"
              style={{ touchAction: 'none' }}
            >
              <div
                className="grid gap-0"
                style={{
                  gridTemplateColumns: `repeat(${puzzle.size}, 1fr)`,
                }}
              >
                {cells.flat().map((cell) => (
                  <div
                    key={getCellKey(cell.x, cell.y)}
                    className={`letter-cell ${cell.isSelected ? 'selected' : ''} ${
                      cell.isFound ? 'found' : ''
                    }`}
                    onMouseDown={() => handleCellMouseDown(cell.x, cell.y)}
                    onMouseEnter={() => handleCellMouseEnter(cell.x, cell.y)}
                    onTouchStart={(e) => {
                      e.preventDefault()
                      handleCellMouseDown(cell.x, cell.y)
                    }}
                    onTouchMove={(e) => {
                      e.preventDefault()
                      const touch = e.touches[0]
                      const element = document.elementFromPoint(touch.clientX, touch.clientY)
                      if (element) {
                        const key = element.getAttribute('data-cell')
                        if (key) {
                          const [x, y] = key.split('-').map(Number)
                          handleCellMouseEnter(x, y)
                        }
                      }
                    }}
                    onTouchEnd={handleMouseUp}
                    data-cell={getCellKey(cell.x, cell.y)}
                  >
                    {cell.letter}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 text-center">
              <button onClick={initGame} className="vintage-btn">
                New Puzzle
              </button>
            </div>
          </div>

          {/* Word List */}
          <div className="column-rule">
            <h2 className="font-display text-xl font-semibold mb-3">
              Words to Find
            </h2>
            <p className="font-body text-sm text-ink-faded mb-4 italic">
              {foundWords.size} of {puzzle.words.length} discovered
            </p>
            <ul className="space-y-1">
              {puzzle.words.map((word) => (
                <li
                  key={word}
                  className={`word-item ${foundWords.has(word) ? 'found' : ''}`}
                >
                  {word}
                </li>
              ))}
            </ul>

            <hr className="section-rule my-6" />

            <div className="font-body text-sm text-ink-faded space-y-2">
              <p className="font-semibold text-ink">How to Play</p>
              <p>
                Click and drag across letters to form words. Words run
                horizontally or vertically.
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-10 pt-4 border-t border-ink-light text-center">
          <p className="font-body text-xs text-ink-faded">
            A quiet moment of discovery &bull; No advertisements &bull; No tracking
          </p>
        </footer>
      </div>

      {/* Win Modal */}
      {showWin && (
        <div className="fixed inset-0 bg-ink/50 flex items-center justify-center z-50 animate-fade-in">
          <div className="bg-paper border-4 border-ink p-8 max-w-md text-center mx-4">
            <h2 className="font-display text-3xl font-bold mb-2">
              EXTRA! EXTRA!
            </h2>
            <p className="font-display text-xl italic mb-4">
              Puzzle Solved!
            </p>
            <p className="font-body mb-6">
              You&apos;ve discovered all the words. Well done, dear reader.
            </p>
            <button
              onClick={() => {
                setShowWin(false)
                initGame()
              }}
              className="vintage-btn"
            >
              Another Puzzle
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
