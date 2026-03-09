// data/statsEngine.js

const MAX_HISTORY = 1000;

/**
 * Record a game result into history and update score/streak/bestStreak.
 * This mirrors your current recordGameResult behavior.
 *
 * state: { score, streak, bestStreak, isDailyMode }
 * params: { word, win, points, attempts, date, mode }
 */
function recordResult(history, state, params) {
  const {
    word,
    win,
    points,
    attempts,
    date,
    mode
  } = params;

  const newHistory = history.slice();
  newHistory.push({
    word,
    result: win ? "Win" : "Loss",
    attempts,
    points,
    date,
    mode
  });

  // Trim history: keep last 1000 entries
  let trimmedHistory = newHistory;
  if (trimmedHistory.length > MAX_HISTORY) {
    trimmedHistory = trimmedHistory.slice(-MAX_HISTORY);
  }

  let { score, streak, bestStreak, isDailyMode } = state;

  // Daily mode streak + score behavior (mirror your script)
  if (isDailyMode) {
    if (win) {
      streak += 1;
      bestStreak = Math.max(bestStreak, streak);
      // In your current code, score += points happens here…
      score += points;
    } else {
      streak = 0;
    }
  }

  // Global win scoring (also in your current code)
  if (win) {
    score += points;
  }

  return {
    history: trimmedHistory,
    score,
    streak,
    bestStreak
  };
}

/**
 * Compute aggregate stats from history.
 * Mirrors updateStatsModal logic (minus DOM).
 */
function computeStats(history) {
  const gamesPlayed = history.length;
  const wins = history.filter(g => g.result === "Win").length;
  const winPercent = gamesPlayed > 0
    ? Math.round((wins / gamesPlayed) * 100)
    : 0;

  // Current streak: from end backwards
  let currentStreak = 0;
  for (let i = history.length - 1; i >= 0; i--) {
    if (history[i].result === "Win") currentStreak++;
    else break;
  }

  // Best streak: longest run
  let bestStreakCalc = 0;
  let tempStreak = 0;
  history.forEach(g => {
    if (g.result === "Win") {
      tempStreak++;
      bestStreakCalc = Math.max(bestStreakCalc, tempStreak);
    } else {
      tempStreak = 0;
    }
  });

  // Guess distribution 1–6
  const distribution = [0, 0, 0, 0, 0, 0];
  history.forEach(g => {
    if (g.result === "Win" && g.attempts >= 1 && g.attempts <= 6) {
      distribution[g.attempts - 1]++;
    }
  });

  return {
    gamesPlayed,
    wins,
    winPercent,
    currentStreak,
    bestStreak: bestStreakCalc,
    distribution
  };
}

module.exports = {
  recordResult,
  computeStats,
  MAX_HISTORY
};
