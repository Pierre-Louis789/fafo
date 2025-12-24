const { scoreGuess } = require("../data/scoringLogic.js");

describe("Scoring logic", () => {
  test("awards +2 for each new green letter", () => {
    const result = scoreGuess({
      guess: "APPLE",
      solution: "AXXXX",
      rewardedGreens: new Set(),
      rewardedYellows: new Set(),
      currentRow: 0,
      score: 0,
      streak: 0
    });

    expect(result.score).toBe(2); // A is green
  });

  test("does not double-reward green letters", () => {
    const result = scoreGuess({
      guess: "APPLE",
      solution: "AXXXX",
      rewardedGreens: new Set(["A"]),
      rewardedYellows: new Set(),
      currentRow: 0,
      score: 10,
      streak: 0
    });

    expect(result.score).toBe(10); // no extra +2
  });

  test("awards +1 for new yellow letters", () => {
    const result = scoreGuess({
      guess: "PLEAP",
      solution: "APPLE",
      rewardedGreens: new Set(),
      rewardedYellows: new Set(),
      currentRow: 0,
      score: 0,
      streak: 0
    });

    expect(result.score).toBe(4); // 4 unique yellows
  });

  test("win scoring adds streak, bonus, and earned", () => {
    const result = scoreGuess({
      guess: "APPLE",
      solution: "APPLE",
      rewardedGreens: new Set(),
      rewardedYellows: new Set(),
      currentRow: 1, // solved on row 2
      score: 0,
      streak: 3
    });

    // bonus = (6 - 1) * 2 = 10
    // earned = 5 + 10 = 15
    expect(result.win).toBe(true);
    expect(result.streak).toBe(4);
    expect(result.earned).toBe(15);
    expect(result.score).toBe(23);
  });

  test("loss resets streak", () => {
    const result = scoreGuess({
      guess: "XXXXX",
      solution: "APPLE",
      rewardedGreens: new Set(),
      rewardedYellows: new Set(),
      currentRow: 5, // last row
      score: 20,
      streak: 7
    });

    expect(result.win).toBe(false);
    expect(result.streak).toBe(0);
    expect(result.score).toBe(20);
  });
});
