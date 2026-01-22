"use client";

import { useEffect, useState } from "react";
import { generateGrid, Grid, Cell, KEY_WORDS, BONUS_WORDS } from "@/utils/crossword";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { Star, RefreshCcw } from "lucide-react";

export default function CrosswordGame() {
    const [grid, setGrid] = useState<Grid>([]);
    const [foundWords, setFoundWords] = useState<string[]>([]);
    const [selectedCells, setSelectedCells] = useState<Cell[]>([]);
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState<Cell | null>(null);
    const [showWin, setShowWin] = useState(false);
    const [loading, setLoading] = useState(true);

    // Brand Colors for KEY WORDS
    const KEY_WORD_COLORS: Record<string, string> = {
        PEEPS: "bg-[#C4F53E]", // Lime
        SPEAK: "bg-[#F850AC]", // Pink
        SHAPE: "bg-[#FF6D00]", // Orange
        SPACE: "bg-[#00C252]", // Green
    };

    // Default color for bonus words
    const BONUS_WORD_COLOR = "bg-zinc-400";
    const SELECTION_COLOR = "bg-zinc-900";

    useEffect(() => {
        startNewGame();
    }, []);

    const startNewGame = () => {
        setLoading(true);
        setShowWin(false);
        setFoundWords([]);
        setSelectedCells([]);
        // elevate generation to next tick to allow UI to show loading if needed
        // and ensuring window is available
        setTimeout(() => {
            setGrid(generateGrid());
            setLoading(false);
        }, 100);
    };

    const handlePointerDown = (cell: Cell) => {
        setIsDragging(true);
        setDragStart(cell);
        setSelectedCells([cell]);
    };

    // Explicitly handle touch move for mobile support where pointerEnter doesn't fire during drag
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!isDragging || !dragStart) return;

        // specific to touch, we need to find the element under the finger
        const touch = e.touches[0];
        const element = document.elementFromPoint(touch.clientX, touch.clientY);

        // Check if we found a cell
        if (element) {
            // We look for the data-attributes we'll add to the cell div
            const row = element.getAttribute("data-row");
            const col = element.getAttribute("data-col");

            if (row !== null && col !== null) {
                const r = parseInt(row);
                const c = parseInt(col);

                // Re-use the existing logic if we moved to a new cell
                // We can just call handlePointerEnter-like logic here, 
                // but we need the cell object.
                if (grid[r] && grid[r][c]) {
                    const cell = grid[r][c];
                    // Only trigger update if it's different or just rely on the calculation logic
                    updateSelection(cell);
                }
            }
        }
    };

    const updateSelection = (cell: Cell) => {
        // Calculate line
        const dx = cell.col - dragStart!.col;
        const dy = cell.row - dragStart!.row;

        const isHorizontal = dy === 0;
        const isVertical = dx === 0;
        const isDiagonal = Math.abs(dx) === Math.abs(dy);

        if (isHorizontal || isVertical || isDiagonal) {
            const steps = Math.max(Math.abs(dx), Math.abs(dy));
            const xStep = dx === 0 ? 0 : dx / steps;
            const yStep = dy === 0 ? 0 : dy / steps;

            const newSelection: Cell[] = [];
            for (let i = 0; i <= steps; i++) {
                const r = dragStart!.row + Math.round(i * yStep);
                const c = dragStart!.col + Math.round(i * xStep);
                if (grid[r] && grid[r][c]) {
                    newSelection.push(grid[r][c]);
                }
            }
            setSelectedCells(newSelection);
        }
    };

    const handlePointerEnter = (cell: Cell) => {
        if (!isDragging || !dragStart) return;
        updateSelection(cell);
    };

    const handlePointerUp = () => {
        setIsDragging(false);
        setDragStart(null);

        if (selectedCells.length === 0) return;

        const word = selectedCells.map((c) => c.char).join("");
        const reverseWord = word.split("").reverse().join("");

        let found = null;
        const allWords = [...KEY_WORDS, ...BONUS_WORDS];

        if (allWords.includes(word) && !foundWords.includes(word)) {
            found = word;
        } else if (allWords.includes(reverseWord) && !foundWords.includes(reverseWord)) {
            found = reverseWord;
        }

        if (found) {
            setFoundWords((prev) => {
                const next = [...prev, found!];
                checkWin(next);
                return next;
            });
        }
        setSelectedCells([]);
    };

    const checkWin = (currentFound: string[]) => {
        // WIN CONDITION: All KEY_WORDS must be found
        const allKeysFound = KEY_WORDS.every(k => currentFound.includes(k));
        if (allKeysFound) {
            setTimeout(() => setShowWin(true), 500);
        }
    };

    // Prevent scrolling when touching grid
    useEffect(() => {
        const preventDefault = (e: TouchEvent) => {
            if (isDragging) e.preventDefault();
        };
        document.addEventListener('touchmove', preventDefault, { passive: false });
        return () => document.removeEventListener('touchmove', preventDefault);
    }, [isDragging]);

    if (loading) {
        return <div className="h-64 flex items-center justify-center"><RefreshCcw className="animate-spin text-zinc-400" /></div>;
    }

    return (
        <div className="flex flex-col items-center justify-center w-full h-full max-w-2xl mx-auto select-none overflow-hidden relative">

            {/* Grid Container - fit content logic */}
            <div
                className="relative bg-white p-1 shadow-sm border-4 border-black touch-none w-full"
                onPointerLeave={handlePointerUp}
                onPointerUp={handlePointerUp}
                onTouchMove={handleTouchMove}
                onTouchEnd={handlePointerUp}
            >
                <div
                    className="grid gap-[1px] bg-zinc-200"
                    style={{
                        gridTemplateColumns: `repeat(${grid.length}, minmax(0, 1fr))`
                    }}
                >
                    {grid.map((row, rIdx) =>
                        row.map((cell, cIdx) => {
                            // Word Highlight Logic
                            let highlightClass = "";
                            const foundWord = cell.words.find(w => foundWords.includes(w));

                            if (foundWord) {
                                // Check if it's a KEY word choice or Bonus
                                if (KEY_WORDS.includes(foundWord)) {
                                    highlightClass = KEY_WORD_COLORS[foundWord];
                                } else {
                                    highlightClass = BONUS_WORD_COLOR;
                                }
                            }

                            const isSelected = selectedCells.some(
                                (c) => c.row === cell.row && c.col === cell.col
                            );

                            return (
                                <div
                                    key={`${rIdx}-${cIdx}`}
                                    data-row={rIdx}
                                    data-col={cIdx}
                                    onPointerDown={(e) => {
                                        // Prevent default to help with touch actions not scrolling
                                        // but need to be careful not to block click completely if that was needed (it's not here)
                                        // e.preventDefault(); 
                                        handlePointerDown(cell);
                                    }}
                                    onPointerEnter={() => handlePointerEnter(cell)}
                                    className={clsx(
                                        "aspect-square w-full flex items-center justify-center text-xs sm:text-base font-bold uppercase cursor-pointer transition-colors duration-200",
                                        isSelected ? "bg-zinc-900 text-white scale-110 z-10 rounded-sm" : "bg-[#FFFDF5] text-zinc-900",
                                        highlightClass && !isSelected && `${highlightClass} text-white`
                                    )}
                                >
                                    {cell.char}
                                </div>
                            );
                        })
                    )}
                </div>
            </div>

            {/* Word List */}
            <div className="mt-4 flex flex-wrap justify-center gap-x-3 gap-y-1 max-w-sm text-[9px] sm:text-xs font-mono uppercase text-white/70">
                {[...KEY_WORDS, ...BONUS_WORDS].sort().map(word => (
                    <span key={word} className={clsx(
                        "transition-colors duration-300",
                        foundWords.includes(word) ? "text-black/50 line-through decoration-black/50" : ""
                    )}>
                        {word}
                    </span>
                ))}
            </div>

            {/* Win Modal / Surprise */}
            <AnimatePresence>
                {showWin && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.8 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    >
                        <div className="bg-[#FFFDF5] p-8 sm:p-12 border-4 border-zinc-900 shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] max-w-sm w-full text-center relative overflow-hidden">
                            {/* Decorative Halftone/Grain */}
                            <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle,black_1px,transparent_1px)] bg-[size:10px_10px]"></div>

                            <div className="relative z-10">
                                <div className="flex justify-center mb-4 text-[#FF4081]">
                                    <Star className="w-12 h-12 fill-current animate-spin-slow" />
                                </div>

                                <h2 className="text-4xl sm:text-5xl font-black uppercase tracking-tighter mb-2 leading-none">
                                    Surprise!
                                </h2>

                                <p className="font-mono text-sm mb-8 text-zinc-600 uppercase tracking-wide">
                                    You found all the words.
                                    <br />
                                    Stay tuned for more.
                                </p>

                                <button
                                    onClick={startNewGame}
                                    className="w-full bg-zinc-900 text-white font-bold uppercase tracking-widest py-4 hover:bg-[#00E5FF] hover:text-black transition-colors flex items-center justify-center gap-2 group"
                                >
                                    <RefreshCcw className="group-hover:rotate-180 transition-transform" />
                                    Play Again
                                </button>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
