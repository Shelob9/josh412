import { Classification, Classification_Source, classifySources, searchString } from './classify';

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


describe('searchString function with array', () => {
  const subject = 'Hello, world! This is a test string.';

  test('should return true when the subject starts with any of the search strings', () => {
    const search = ['Hello', 'world', 'test'];
    expect(searchString(subject, search, 'starts')).toBe(true);
  });

  test('should return false when the subject does not start with any of the search strings', () => {
    const search = ['world', 'test', 'string'];
    expect(searchString(subject, search, 'starts')).toBe(false);
  });

  test('should return true when the subject ends with any of the search strings', () => {
    const search = ['string.', 'Hello', 'world'];
    expect(searchString(subject, search, 'ends')).toBe(true);
  });

  test('should return false when the subject does not end with any of the search strings', () => {
    const search = ['Hello', 'world', 'test'];
    expect(searchString(subject, search, 'ends')).toBe(false);
  });

  test('should return true when the subject exactly matches any of the search strings', () => {
    const search = ['Hello, world! This is a test string.', 'Hello', 'world'];
    expect(searchString(subject, search, 'exact')).toBe(true);
  });

  test('should return false when the subject does not exactly match any of the search strings', () => {
    const search = ['Hello, world!', 'This is a test', 'string'];
    expect(searchString(subject, search, 'exact')).toBe(false);
  });
});

describe('classifySources', () => {
  const sources : Classification_Source[] = [
    {
      id: '1',
      text: 'Hello, world!',
      sourcetype: 'test',
    },
    {
      id: '2',
      text: 'This is a test string.',
      sourcetype: 'test',
    },
  ];
  test( 'should return an empty array when there are no matches', () => {
    const classifications : Classification[] = [
      {
        searches: [
          {
            search: 'test',
            where: 'exact',
            all: false,
          },
        ],
        all: false,
        id: 'test',
      },
    ];
    expect(classifySources(sources, classifications)).toEqual([]);
  });
  test( 'should return an array of matches when there are matches', () => {
    const classifications : Classification[] = [
      {
        searches: [
          {
            search: 'Hello',
            where: 'contains',
            all: false,
          },
        ],
        all: false,
        id: 'test',
      },
    ];
    expect(classifySources(sources, classifications)).toEqual([
      {
        source: sources[0],
        classifications: [classifications[0].id],
      },
    ]);
  }
  );
  test( 'should return an array of matches when there are multiple matches', () => {
    const classifications : Classification[] = [
      {
        searches: [
          {
            search: 'Hello',
            where: 'contains',
            all: false,
          },
        ],
        all: false,
        id: 'test1',
      },
      {
        searches: [
          {
            search: 'food and stuff',
            where: 'exact',
            all: false,
          },
        ],
        all: false,
        id: 'test2',
      },
      {
        searches: [
          {
            search: 'test',
            where: 'contains',
            all: false,
          },
        ],
        all: false,
        id: 'test3',
      },
    ];
    expect(classifySources(sources, classifications)).toEqual([
      {
        source: sources[0],
        classifications: ["test1"],
      },
      {
        source: sources[1],
        classifications: ["test3"],
      },
    ]);
  } );

});
