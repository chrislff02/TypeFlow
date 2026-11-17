import { WORDS } from "../data/words";

// Generate a random sequence of words.
export function generateWords(count: number = 50): string {
  const generatedWords: string[] = [];

  for (let i = 0; i < count; i++) {
    // Choose a random index from the word list.
    const randomIndex = Math.floor(Math.random() * WORDS.length);

    // Get the corresponding word.
    const randomWord = WORDS[randomIndex];

    // Add the word to our generated sequence.
    generatedWords.push(randomWord);
  }

  // Combine the words into one string separated by spaces.
  return generatedWords.join(" ");
}
