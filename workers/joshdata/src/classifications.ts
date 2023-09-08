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
export const CLASSIFIER_GM_ID = 'gm';
export const CLASSIFIER_GN_ID = 'gn';
export const CLASSIFIER_DOG_ID = 'dog';

export const CLASSIFICATION_IDS = {
    CLASSIFIER_GM_ID: 'gm',
    CLASSIFIER_GN_ID: 'gn',
    CLASSIFIER_DOG_ID:'dog',

}
export const CLASSIFIER_GM = createClassifier([
    'good morning',
    'Good Morning',
    'Good morning',
    'good Morning',
    'gm',
    'GM',
],false,CLASSIFIER_GM_ID);
export const CLASSIFIERS : Classifier_Params[] = [
    CLASSIFIER_GM,
    createClassifier([
        'Good Night',
        'good night',
        'Good night',
        'good Night',
        'gn',
        'GN',
    ],false,CLASSIFIER_GN_ID),
    createClassifier([
        'dog',
        'Dog',
        'dogs',
        'Dogs',
    ],false,CLASSIFIER_DOG_ID),

];
