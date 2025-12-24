const {
  addLetterToRow,
  removeLetterFromRow,
  isRowFull
} = require("../data/rowLogic.js");

describe("Row input logic", () => {
  test("adds letters in order", () => {
    let row = ["", "", "", "", ""];
    row = addLetterToRow(row, "A");
    row = addLetterToRow(row, "B");
    row = addLetterToRow(row, "C");
    expect(row).toEqual(["A", "B", "C", "", ""]);
  });

  test("does not add letters when row is full", () => {
    const row = ["A", "B", "C", "D", "E"];
    const result = addLetterToRow(row, "F");
    expect(result).toEqual(["A", "B", "C", "D", "E"]);
  });

  test("removes the last filled letter", () => {
    let row = ["A", "B", "C", "", ""];
    row = removeLetterFromRow(row);
    expect(row).toEqual(["A", "B", "", "", ""]);
  });

  test("removing from empty row does nothing", () => {
    const row = ["", "", "", "", ""];
    const result = removeLetterFromRow(row);
    expect(result).toEqual(["", "", "", "", ""]);
  });

  test("detects when row is full", () => {
    expect(isRowFull(["A", "B", "C", "D", "E"])).toBe(true);
    expect(isRowFull(["A", "B", "C", "", ""])).toBe(false);
  });
});
