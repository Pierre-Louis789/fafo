function evaluateGuess(guess, solution) {
  const targetArr = [...solution];
  const guessArr = [...guess];
  const counts = {};

  targetArr.forEach(l => counts[l] = (counts[l] || 0) + 1);

  const result = Array(5).fill("absent");

  // First pass: correct letters
  for (let i = 0; i < 5; i++) {
    if (guessArr[i] === targetArr[i]) {
      result[i] = "correct";
      counts[guessArr[i]] -= 1;
    }
  }

  // Second pass: present letters
  for (let i = 0; i < 5; i++) {
    if (result[i] === "correct") continue;
    const letter = guessArr[i];
    if (counts[letter] > 0) {
      result[i] = "present";
      counts[letter] -= 1;
    }
  }

  return result;
}

module.exports = { evaluateGuess };
