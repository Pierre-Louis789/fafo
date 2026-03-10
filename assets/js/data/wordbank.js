// 📚 LogicLine Word Bank
// ===========================


let solutionWords = [];
let validGuesses = [];

fetch("assets/js/data/dictionary.txt")
  .then(res => res.text())
  .then(text => {
    const words = text
      .split(/\r?\n/)
      .map(w => w.trim().toUpperCase())
      .filter(w => w.length === 5);

    
    solutionWords = words;
    validGuesses = words;
  });


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