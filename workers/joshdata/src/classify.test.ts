import { searchString } from './classify';  

describe('searchString function', () => {
  const subject = 'Hello, world!';

  test('should return true when the subject starts with the search string', () => {
    expect(searchString(subject, 'Hello', 'starts')).toBe(true);
  });

  test('should return false when the subject does not start with the search string', () => {
    expect(searchString(subject, 'world', 'starts')).toBe(false);
  });

  test('should return true when the subject ends with the search string', () => {
    expect(searchString(subject, 'world!', 'ends')).toBe(true);
  });

  test('should return false when the subject does not end with the search string', () => {
    expect(searchString(subject, 'Hello', 'ends')).toBe(false);
  });

  test('should return true when the subject contains the search string', () => {
    expect(searchString(subject, 'lo, wo', 'contains')).toBe(true);
  });

  test('should return false when the subject does not contain the search string', () => {
    expect(searchString(subject, 'test', 'contains')).toBe(false);
  });

  test('should return true when the subject exactly matches the search string', () => {
    expect(searchString(subject, 'Hello, world!', 'exact')).toBe(true);
  });

  test('should return false when the subject does not exactly match the search string', () => {
    expect(searchString(subject, 'Hello, world', 'exact')).toBe(false);
  });
});
