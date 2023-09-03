type Where = 'starts' | 'ends' | 'contains' | 'exact';

function searchString(subject: string, search: string | string[], where: Where, all = false): boolean {
  if (Array.isArray(search)) {
    if (all) {
      return search.every(s => searchString(subject, s, where));
    } else {
      return search.some(s => searchString(subject, s, where));
    }
  } else {
    switch(where) {
      case 'starts':
        return subject.startsWith(search);
      case 'ends':
        return subject.endsWith(search);
      case 'contains':
        return subject.includes(search);
      case 'exact':
        return subject === search;
      default:
        return false;
    }
  }
}
type Classification = {
	// search(es) to run.
  searches: {
    search: string | string[];
	  where: Where;
		all: boolean;
	}[];
	// If all searches, or just one must match
	all: boolean;
	// classification id
	id: string;
};

type Source = {
	//id of item it is stored in
  id: string;
	// actual content
// todo support arrays of strings and of blocks 
  text:string;
	// what table or kv source id is in
	sourcetype:string;
};

type Match = {
  source: Source;
  classifications: string[];
}

function classifySources(sources: Source[], classifications: Classification[]): Match[] {
  const matches: Match[] = [];

  // iterate over each source
  sources.forEach(source => {
    const matchedClassifications: string[] = [];

    // iterate over each classification
    classifications.forEach(classification => {
      // check if all searches match the source text
      const allSearchesMatch = classification.searches.every(search => {
        return searchString(source.text, search.search, search.where, search.all);
      });

      // if all searches must match and they do, or if not all searches must match and at least one does,
      // add the classification id to the matched classifications
      if ((classification.all && allSearchesMatch) || (!classification.all && classification.searches.some(search => {
        return searchString(source.text, search.search, search.where, search.all);
      }))) {
        matchedClassifications.push(classification.id);
      }
    });

    // if there are any matched classifications, add a new match with the source and the matched classifications
    if (matchedClassifications.length > 0) {
      matches.push({
        source: source,
        classifications: matchedClassifications
      });
    }
  });
  return matches;
}
