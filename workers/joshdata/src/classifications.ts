import { SearchWhere } from "./classify";

export type Classificatuon_Search = {
    search: string | string[];
    where: SearchWhere;
    all: boolean;
}
export type Classification = {
	// search(es) to run.
    searches: Classificatuon_Search[];
	// If all searches, or just one must match
	all: boolean;
	// classification id
	id: string;
};

export const createClassification = (searches: string[], all: boolean, id: string): Classification => {
    return {
        searches: searches.map(search => {
            return {
                search,
                where: 'contains',
                all: false,
            }
        }),
        all,
        id,
    }
}
//one constant for each ID
export const CLASSIFICATION_GM_ID = 'gm';
export const CLASSIFICATION_GN_ID = 'gn';
export const CLASSIFICATION_DOG_ID = 'dog';

export const CLASSIFICATION_IDS = {
    CLASSIFICATION_GM_ID: 'gm',
    CLASSIFICATION_GN_ID: 'gn',
    CLASSIFICATION_DOG_ID:'dog',

}
export const CLASSIFICATION_GM = createClassification([
    'good morning',
    'Good Morning',
    'Good morning',
    'good Morning',
    'gm',
    'GM',
],false,CLASSIFICATION_GM_ID);
export const CLASSIFICATIONS : Classification[] = [
    CLASSIFICATION_GM,
    createClassification([
        'Good Night',
        'good night',
        'Good night',
        'good Night',
        'gn',
        'GN',
    ],false,CLASSIFICATION_GN_ID),
    createClassification([
        'dog',
        'Dog',
        'dogs',
        'Dogs',
    ],false,CLASSIFICATION_DOG_ID),

];
