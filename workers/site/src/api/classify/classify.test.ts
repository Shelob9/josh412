import { CLASSIFIERS, CLASSIFIER_GM, CLASSIFIER_GM_ID, CLASSIFIER_GN_ID } from './classifiers';
import {  Classification_Source, classifySources, searchString } from './classify';

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
  const network = 'mastodon';
  const sources : Classification_Source[] = [
    {
        id: 'gmhtml',
        text: '<p>Good Morning</p>',
        sourcetype: network,
    },
    {
      id: 'notmatch',
      text: 'This is a test string',
      sourcetype: network,
    },
    {
        id: 'gmnohtml',
        text: 'Good Morning',
        sourcetype: network,
    }
];
  //it finds both good morning sources
  test('CLASSIFICATION_GM match two', () => {
    const matches = classifySources(sources, [
      CLASSIFIER_GM,
    ]);
    expect(Object.keys(matches).length).toBe(2);
    expect(matches['gmhtml']).toEqual([CLASSIFIER_GM_ID]);
    expect(matches['gmnohtml']).toEqual([CLASSIFIER_GM_ID]);
  });

  test( 'CLASSIFICATION_GM with gm', () => {
    const matches = classifySources([
      {
        id: 'gmhtml',
        text: '<p>gm</p>',
        sourcetype: network,
    },
    {
      id: 'notmatch',
      text: 'This is a test string',
      sourcetype: network,
    },
    ], [
      CLASSIFIER_GM,
    ]);
    expect(Object.keys(matches).length).toBe(1);
    expect(matches['gmhtml']).toEqual([CLASSIFIER_GM_ID]);
  });

  test( 'With all classifications', () => {
    const matches = classifySources([
      ...sources,
      {
        id: 'gnhtml',
        text: '<p>gn</p>',
        sourcetype: network,
      },
      //not matching
      {
        id: 'notmatch',
        text: 'This is a test string',
        sourcetype: network,
      },
      {
        id: 'gnnohtml',
        text: 'Good Night',
        sourcetype: network,
      }
    ], CLASSIFIERS);
    expect(Object.keys(matches).length).toBe(4);
    expect(matches['gnhtml']).toEqual([CLASSIFIER_GN_ID]);
    expect(matches['gnnohtml']).toEqual([CLASSIFIER_GN_ID]);
    expect(matches['gmhtml']).toEqual([CLASSIFIER_GM_ID]);
    expect(matches['gmnohtml']).toEqual([CLASSIFIER_GM_ID]);

  } );

  test( 'With all classifications and gm', () => {
    const sources = [
      {
          "id": "109467285531018674",
          "text": "<p>Good morning</p>",
          "sourcetype": "mastodon"
      },
      {
        "id": "209",
        "text": "<p>Good morning tacos Good night spoons</p>",
        "sourcetype": "mastodon"
    }
    ];
    const matches = classifySources(sources, CLASSIFIERS);
    expect(Object.keys(matches).length).toBe(2);
    expect(matches).toEqual({
      "109467285531018674": [
        "gm"
      ],
      "209": [
        "gm",
        "gn"
      ]
    });
  } );

  test( 'With all classifications and gm', () => {
    const sources = [
      {
          "id": "109",
          "text": "<p>Good morning</p>",
          "sourcetype": "mastodon"
      },
      {
        "id": "209",
        "text": "<p>I finished reading </p>",
        "sourcetype": "mastodon"
    }
    ];
    const matches = classifySources(sources, CLASSIFIERS);
    expect(matches).toEqual({
      "109": [
        "gm"
      ],
      "209": [
        "books",
      ]
    });
  } );


});
