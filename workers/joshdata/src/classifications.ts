import { SearchWhere } from "./classify";

export type Classifier_Search_Params = {
    search: string | string[];
    where: SearchWhere;
    all: boolean;
}
export type Classifier_Params = {
	// search(es) to run.
    searches: Classifier_Search_Params[];
	// If all searches, or just one must match
	all: boolean;
	// classification id
	id: string;
};

export const createClassifier = (searches: string[], all: boolean, id: string): Classifier_Params => {
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
export const CLASSIFICATION_GM = createClassifier([
    'good morning',
    'Good Morning',
    'Good morning',
    'good Morning',
    'gm',
    'GM',
],false,CLASSIFICATION_GM_ID);
export const CLASSIFICATIONS : Classifier_Params[] = [
    CLASSIFICATION_GM,
    createClassifier([
        'Good Night',
        'good night',
        'Good night',
        'good Night',
        'gn',
        'GN',
    ],false,CLASSIFICATION_GN_ID),
    createClassifier([
        'dog',
        'Dog',
        'dogs',
        'Dogs',
    ],false,CLASSIFICATION_DOG_ID),

];
