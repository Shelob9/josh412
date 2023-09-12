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
    const where = 'contains';
    return {
        searches: searches.map(search => {
            return {
                search,
                where,
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
export const CLASSIFIER_WP_ID = 'code_wp';
export const CLASSIFIER_JS_ID = 'code_js';
export const CLASSIFIER_PHP_ID = 'code_php';
//books
export const CLASSIFIER_BOOKS_ID = 'books';
//AI
export const CLASSIFIER_AI_ID = 'ai';
//environment
export const CLASSIFIER_ENV_ID = 'env';

export const CLASSIFICATION_IDS = {
    CLASSIFIER_GM_ID: CLASSIFIER_GM_ID,
    CLASSIFIER_GN_ID: CLASSIFIER_GN_ID,
    CLASSIFIER_DOG_ID: CLASSIFIER_DOG_ID,
    CLASSIFIER_WP_ID: CLASSIFIER_WP_ID,
    CLASSIFIER_JS_ID: CLASSIFIER_JS_ID,
    CLASSIFIER_PHP_ID: CLASSIFIER_PHP_ID,
    CLASSIFIER_BOOKS_ID: CLASSIFIER_BOOKS_ID,
    CLASSIFIER_AI_ID: CLASSIFIER_AI_ID,
    CLASSIFIER_ENV_ID: CLASSIFIER_ENV_ID,
}
export const CLASSIFIER_GM = createClassifier([
    'good morning',
    'Good Morning',
    'Good morning',
    'good Morning',
    'gm',
    'GM',
],false,CLASSIFIER_GM_ID);
//Includes WordPress or wordpress
export const CLASSIFIER_WP = createClassifier([
    'wordpress',
    'WordPress',
],false,CLASSIFIER_WP_ID);
//Includes JavaScript, javascript, js
// Or React or react or tsx or jsx
// Or TypeScript or typescript or ts
export const CLASSIFIER_JS = createClassifier([
    'javascript',
    'JavaScript',
    'js',
    'JS',
    'React',
    'react',
    'tsx',
    'jsx',
    'TypeScript',
    'typescript',
    'ts',
],false,CLASSIFIER_JS_ID);
//Includes PHP or php
export const CLASSIFIER_PHP = createClassifier([
    'php',
    'PHP',
    'Laravel',
    'composer'
],false,CLASSIFIER_PHP_ID);
export const CLASSIFIER_BOOKS = createClassifier([
    'books',
    'Books',
    'Finished reading',
    'finished reading',
    'Book',
    'book',
], false, CLASSIFIER_BOOKS_ID);

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
        'puppy',
        'doggo',
        'puppers',
        'Macy',
        'macy',
    ],false,CLASSIFIER_DOG_ID),
    CLASSIFIER_WP,
    CLASSIFIER_JS,
    CLASSIFIER_PHP,
    CLASSIFIER_BOOKS,
    createClassifier([
        'AI',
        'ai',
        'OpenAI',
        'GPT-3',
        'GPT3',
        'chat-gpt',
        'Hugging Face',
        'LLM',
        'llm',
        'Large Language Model',
        'Copilot',
        'copilot',
    ],false,CLASSIFIER_AI_ID),

];
