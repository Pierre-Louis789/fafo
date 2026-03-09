function addLetterToRow(row, letter) {
  const filled = row.findIndex(t => t === "");
  if (filled === -1) return row; // row full
  const newRow = [...row];
  newRow[filled] = letter;
  return newRow;
}

function removeLetterFromRow(row) {
  const filled = row.findLastIndex(t => t !== "");
  if (filled === -1) return row; // row empty
  const newRow = [...row];
  newRow[filled] = "";
  return newRow;
}

function isRowFull(row) {
  return row.every(t => t !== "");
}

module.exports = {
  addLetterToRow,
  removeLetterFromRow,
  isRowFull
};
