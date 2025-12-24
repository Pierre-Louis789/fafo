// 📚 LogicLine Word Bank
// ===========================

// Load external dictionary (one word per line in data/dictionary.txt)
let solutionWords = [];
let validGuesses = [];

fetch("data/dictionary.txt")
  .then(res => res.text())
  .then(text => {
    const words = text
      .split(/\r?\n/)
      .map(w => w.trim().toUpperCase())
      .filter(w => w.length === 5);

    // Use the dictionary both for solutions and guesses
    solutionWords = words;
    validGuesses = words;
  });

// Utility functions
  export function getRandomSolution() {
  const index = Math.floor(Math.random() * solutionWords.length);
  return solutionWords[index];
}

export function isValidGuess(word) {
  return validGuesses.includes(word.toUpperCase());
}
export function isCorrectLength(word) {
  return word.length === 5;
}
export function isValidWord(word) {
  return solutionWords.includes(word.toUpperCase());
}