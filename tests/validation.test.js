const { isValidWord, isCorrectLength } = require('./__mocks__/wordbank.js');

describe('Word validation', () => {
  test('accepts 5-letter words', () => {
    expect(isCorrectLength('APPLE')).toBe(true);
  });

  test('rejects words shorter than 5 letters', () => {
    expect(isCorrectLength('DOG')).toBe(false);
  });

  test('rejects words longer than 5 letters', () => {
    expect(isCorrectLength('BANANA')).toBe(false);
  });

  test('accepts words in the dictionary', () => {
    expect(isValidWord('APPLE')).toBe(true);
  });

  test('rejects words not in the dictionary', () => {
    expect(isValidWord('ZZZZZ')).toBe(false);
  });
});
