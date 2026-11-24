// Calculate typing statistics using a shared scoring methodology.
export function calculateTypingStats(
  text: string,
  typedText: string,
  elapsedMs: number,
  isFinished = false,
) {
  let correctCharacters = 0;

  // Compare each typed character with its expected character.
  for (let index = 0; index < typedText.length; index++) {
    if (typedText[index] === text[index]) {
      correctCharacters++;
    }
  }

  // Count incorrectly typed characters.
  const incorrectCharacters = typedText.length - correctCharacters;

  // Calculate accuracy from the current input.
  const accuracy =
    typedText.length > 0
      ? Math.round((correctCharacters / typedText.length) * 100)
      : 100;

  // Use precise elapsed time for completed tests.
  // Apply a minimum of one second for live statistics.
  const elapsedMinutes = Math.max(elapsedMs, isFinished ? 1 : 1000) / 60000;

  // Calculate words per minute using five characters per word.
  const wpm =
    elapsedMs > 0 ? Math.round(correctCharacters / 5 / elapsedMinutes) : 0;

  return {
    wpm,
    accuracy,
    correctCharacters,
    incorrectCharacters,
  };
}
