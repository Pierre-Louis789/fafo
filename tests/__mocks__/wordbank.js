function isValidWord(word) {
  return ["APPLE", "LEMON", "BERRY"].includes(word);
}

function isCorrectLength(word) {
  return word.length === 5;
}

module.exports = {
  isValidWord,
  isCorrectLength
};
