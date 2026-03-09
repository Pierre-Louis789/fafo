function scoreGuess({
  guess,
  solution,
  rewardedGreens,
  rewardedYellows,
  currentRow,
  score,
  streak
}) {
  const targetArr = [...solution];
  const guessArr = [...guess];
  const counts = {};

  targetArr.forEach(l => counts[l] = (counts[l] || 0) + 1);

  let correctCount = 0;

  // First pass: correct letters
  for (let i = 0; i < 5; i++) {
    const letter = guessArr[i];
    if (letter === targetArr[i]) {
      correctCount++;
      counts[letter] -= 1;

      if (!rewardedGreens.has(letter)) {
        score += 2;
        rewardedGreens.add(letter);
      }
    }
  }

  // Second pass: present letters
  for (let i = 0; i < 5; i++) {
    const letter = guessArr[i];
    if (letter === targetArr[i]) continue;

    if (counts[letter] > 0) {
      counts[letter] -= 1;

      if (!rewardedYellows.has(letter)) {
        score += 1;
        rewardedYellows.add(letter);
      }
    }
  }

  // Win condition
  if (correctCount === 5) {
    streak++;
    const bonus = (6 - currentRow) * 2;
    const earned = 5 + bonus;
    score += earned;

    return {
      score,
      streak,
      win: true,
      earned
    };
  }

  // Loss condition
  if (currentRow === 5) {
    streak = 0;
    return {
      score,
      streak,
      win: false,
      earned: 0
    };
  }

  // Normal guess
  return {
    score,
    streak,
    win: false,
    earned: 0
  };
}

module.exports = { scoreGuess };
