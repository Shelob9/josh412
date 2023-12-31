import { Classifier_Params, Classifier_Search_Params } from "./classifiers";

export type SearchWhere = 'starts' | 'ends' | 'contains' | 'exact';

export const ITEM_TYPE_SOCIAL_POST = 'social_post';
export const SOURCE_TYPE_MASTODON = 'mastodon';
export const SOURCE_TYPE_BLUESKY = 'bluesky';

export const CLASSIFICATION_ITEM_TYPES : string[]= [
  ITEM_TYPE_SOCIAL_POST
];

export const CLASSIFICATION_SOURCE_TYPES : string[] = [
  SOURCE_TYPE_MASTODON,
  SOURCE_TYPE_BLUESKY,
];
export function searchString(subject: string, search: string | string[], where: SearchWhere, all = false): boolean {
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


export type Classification_Source = {
	//id of item it is stored in
  id: string;
	// actual content
// todo support arrays of strings and of blocks
  text:string;
	// what table or kv source id is in
	sourcetype:string;
};

export type Classification_Matches = {
  //key is source id,
  //value is array of classification ids
  [key:string]:string[]
}
export function classifySources(sources: Classification_Source[], classifications: Classifier_Params[]): Classification_Matches {
  const matches: Classification_Matches = {};

  // iterate over each source
  sources.forEach(source => {
    const matchedClassifications: string[] = [];

    // iterate over each classification
    classifications.forEach(classification => {
      // check if all searches match the source text
      const allSearchesMatch = classification.searches.every((search:Classifier_Search_Params) => {
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
      matches[source.id] = matchedClassifications;
    }
  });
  return matches;
}
