const { evaluateGuess } = require("../data/evaluateGuess.js");

describe("Guess evaluation logic", () => {
  test("all correct letters", () => {
    expect(evaluateGuess("APPLE", "APPLE")).toEqual([
      "correct", "correct", "correct", "correct", "correct"
    ]);
  });

  test("all absent letters", () => {
    expect(evaluateGuess("ZZZZZ", "APPLE")).toEqual([
      "absent", "absent", "absent", "absent", "absent"
    ]);
  });

  test("present letters in wrong positions", () => {
    expect(evaluateGuess("PLEAP", "APPLE")).toEqual([
      "present", "present", "present", "present", "present"
    ]);
  });

  test("mixed correct, present, absent", () => {
  expect(evaluateGuess("ALERT", "APPLE")).toEqual([
    "correct",
    "present",
    "present",
    "absent",
    "absent"
  ]);
});

test("handles repeated letters correctly", () => {
  expect(evaluateGuess("LLAMA", "APPLE")).toEqual([
    "present",
    "absent",
    "present",
    "absent",
    "absent"
  ]);
});
});
