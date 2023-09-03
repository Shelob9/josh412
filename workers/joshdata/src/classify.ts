type Where = 'starts' | 'ends' | 'contains' | 'exact';
type Classification = {
	// search(es) to run.
  searches: {
    search: string | string[];
	  where: Where;
		all: boolean;
	}[];
	// If all searches, or just one must match
	all: boolean;
	// classification name
	name: string;
}
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
