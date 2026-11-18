import { WORDS } from "../data/words";

// Available difficulty levels.
export type Difficulty = "easy" | "medium" | "hard";

// Organize words based on difficulty.
const WORD_LISTS: Record<Difficulty, string[]> = {
  easy: WORDS.filter((word) => word.length <= 4),

  medium: WORDS.filter((word) => word.length >= 5 && word.length <= 6),

  hard: WORDS.filter((word) => word.length >= 7),
};

// Generate random words based on difficulty.
export function generateWords(
  count: number = 50,
  difficulty: Difficulty = "medium",
): string {
  const generatedWords: string[] = [];

  // Select the appropriate word list.
  const wordList = WORD_LISTS[difficulty];

  // Generate the requested number of words.
  for (let i = 0; i < count; i++) {
    const randomIndex = Math.floor(Math.random() * wordList.length);

    generatedWords.push(wordList[randomIndex]);
  }

  // Combine the generated words into one string.
  return generatedWords.join(" ");
}
