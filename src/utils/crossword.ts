export type Cell = {
    row: number;
    col: number;
    char: string;
    isPart: boolean;
    words: string[]; // word IDs
};

export type Grid = Cell[][];

// The "Secret" keys that trigger the ending
export const KEY_WORDS = ["PEEPS", "SPEAK", "SHAPE", "SPACE"];

// Bonus atmosphere words
export const BONUS_WORDS = [
    "PARTICIPATORY",
    "PLACEMAKING",
    "SOCIALDESIGN",
    "DESIGNTHINKING",
    "COCREATION",
    // "COLLECTIVE", // Might be too many for 15x15 if we want clean spacing, but let's try
    "COLLABORATION",
];

export const ALL_WORDS = [...KEY_WORDS, ...BONUS_WORDS];

export const GRID_SIZE = 15;

function canPlaceWord(grid: Grid, word: string, row: number, col: number, dx: number, dy: number): boolean {
    if (row + dy * (word.length - 1) < 0 || row + dy * (word.length - 1) >= GRID_SIZE) return false;
    if (col + dx * (word.length - 1) < 0 || col + dx * (word.length - 1) >= GRID_SIZE) return false;

    for (let i = 0; i < word.length; i++) {
        const r = row + dy * i;
        const c = col + dx * i;
        const cell = grid[r][c];
        if (cell.char && cell.char !== word[i]) return false;
    }
    return true;
}

function placeWord(grid: Grid, word: string): boolean {
    // Try random positions multiple times
    const attempts = 100;
    for (let a = 0; a < attempts; a++) {
        const dir = Math.random() > 0.5 ? 'H' : 'V';
        const dx = dir === 'H' ? 1 : 0;
        const dy = dir === 'V' ? 1 : 0;

        // Slight optimization: ensure random start is within bounds
        const row = Math.floor(Math.random() * GRID_SIZE);
        const col = Math.floor(Math.random() * GRID_SIZE);

        if (canPlaceWord(grid, word, row, col, dx, dy)) {
            for (let i = 0; i < word.length; i++) {
                const r = row + dy * i;
                const c = col + dx * i;
                grid[r][c].char = word[i];
                grid[r][c].isPart = true;
                grid[r][c].words.push(word);
            }
            return true;
        }
    }
    return false;
}

export function generateGrid(): Grid {
    // Initialize empty grid
    const grid: Grid = Array.from({ length: GRID_SIZE }, (_, row) =>
        Array.from({ length: GRID_SIZE }, (_, col) => ({
            row,
            col,
            char: "",
            isPart: false,
            words: [],
        }))
    );

    // Place Key Words first to ensure they fit
    // We can also try to "scatter" them specifically if needed, 
    // but random placement usually scatters them well enough in 15x15.
    // Let's sort by length descending to place hardest words first
    const wordsToPlace = [...ALL_WORDS].sort((a, b) => b.length - a.length);

    wordsToPlace.forEach(word => {
        const placed = placeWord(grid, word);
        if (!placed) {
            console.warn(`Could not place word: ${word}`);
            // Fallback: try really hard or just skip (for now skip to avoid infinite loops)
        }
    });

    // Fill empty spots
    const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < GRID_SIZE; r++) {
        for (let c = 0; c < GRID_SIZE; c++) {
            if (!grid[r][c].char) {
                grid[r][c].char = letters[Math.floor(Math.random() * letters.length)];
            }
        }
    }

    return grid;
}
