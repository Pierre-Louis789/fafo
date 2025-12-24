// tests/statsEngine.test.js

const { recordResult, computeStats, MAX_HISTORY } = require("../data/statsEngine.js");

describe("Stats engine - recordResult", () => {
  test("records a win with correct structure", () => {
    const history = [];
    const state = {
      score: 0,
      streak: 0,
      bestStreak: 0,
      isDailyMode: false
    };

    const { history: newHistory, score, streak, bestStreak } = recordResult(history, state, {
      word: "APPLE",
      win: true,
      points: 10,
      attempts: 3,
      date: "2025-12-24 18:00",
      mode: "Random"
    });

    expect(newHistory.length).toBe(1);
    expect(newHistory[0]).toEqual({
      word: "APPLE",
      result: "Win",
      attempts: 3,
      points: 10,
      date: "2025-12-24 18:00",
      mode: "Random"
    });

    expect(score).toBe(10);
    expect(streak).toBe(0);      // non-daily: no streak change here
    expect(bestStreak).toBe(0);
  });

  test("trims history to last MAX_HISTORY entries", () => {
    const history = [];
    for (let i = 0; i < MAX_HISTORY + 10; i++) {
      history.push({
        word: "WORD" + i,
        result: "Win",
        attempts: 3,
        points: 1,
        date: "d",
        mode: "Random"
      });
    }

    const state = {
      score: 0,
      streak: 0,
      bestStreak: 0,
      isDailyMode: false
    };

    const { history: trimmed } = recordResult(history, state, {
      word: "FINAL",
      win: true,
      points: 1,
      attempts: 4,
      date: "now",
      mode: "Random"
    });

    expect(trimmed.length).toBe(MAX_HISTORY);
    expect(trimmed[trimmed.length - 1].word).toBe("FINAL");
  });

  test("daily win increments streak, bestStreak, and adds double points", () => {
    const history = [];
    const state = {
      score: 0,
      streak: 2,
      bestStreak: 3,
      isDailyMode: true
    };

    const { score, streak, bestStreak } = recordResult(history, state, {
      word: "APPLE",
      win: true,
      points: 10,
      attempts: 3,
      date: "2025-12-24 18:00",
      mode: "Daily"
    });

    // daily win: score += points (inside daily block) + points (global win)
    expect(score).toBe(20);
    expect(streak).toBe(3);      // 2 -> 3
    expect(bestStreak).toBe(3);  // unchanged because max was already 3
  });

  test("daily loss resets streak but does not change score", () => {
    const history = [];
    const state = {
      score: 50,
      streak: 4,
      bestStreak: 5,
      isDailyMode: true
    };

    const { score, streak, bestStreak } = recordResult(history, state, {
      word: "APPLE",
      win: false,
      points: 10,
      attempts: 6,
      date: "2025-12-24 18:05",
      mode: "Daily"
    });

    expect(score).toBe(50);
    expect(streak).toBe(0);
    expect(bestStreak).toBe(5);
  });

  test("random win adds points once, no streak effects", () => {
    const history = [];
    const state = {
      score: 30,
      streak: 4,
      bestStreak: 5,
      isDailyMode: false
    };

    const { score, streak, bestStreak } = recordResult(history, state, {
      word: "APPLE",
      win: true,
      points: 7,
      attempts: 2,
      date: "2025-12-24 18:10",
      mode: "Random"
    });

    expect(score).toBe(37);
    expect(streak).toBe(4);
    expect(bestStreak).toBe(5);
  });
});

describe("Stats engine - computeStats", () => {
  test("computes games, wins, win%, streaks, and distribution", () => {
    const history = [
      { result: "Win",  attempts: 2, points: 5, word: "A", date: "d1", mode: "Daily" },
      { result: "Win",  attempts: 3, points: 5, word: "B", date: "d2", mode: "Daily" },
      { result: "Loss", attempts: 6, points: 0, word: "C", date: "d3", mode: "Daily" },
      { result: "Win",  attempts: 1, points: 5, word: "D", date: "d4", mode: "Random" },
      { result: "Win",  attempts: 6, points: 5, word: "E", date: "d5", mode: "Random" }
    ];

    const stats = computeStats(history);

    expect(stats.gamesPlayed).toBe(5);
    expect(stats.wins).toBe(4);
    expect(stats.winPercent).toBe(80); // 4/5

    // current streak: last results are Win, so count backwards
    // last two are Win, Win -> streak 2
    expect(stats.currentStreak).toBe(2);

    // best streak: first two wins -> streak 2; then reset; then two wins -> streak 2
    expect(stats.bestStreak).toBe(2);

    // distribution: attempts 1,2,3,6 occurred as wins
    expect(stats.distribution).toEqual([1, 1, 1, 0, 0, 1]);
  });
});
