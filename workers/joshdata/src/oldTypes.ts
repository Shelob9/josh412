
export type CONTENT_TYPE = 'photo' | 'media' | 'socialpost';
export type TAXONOMY = {
	id: number;
	slug: string;
	label: string;
	private?: boolean;
}
export type TAXONOMIES = TAXONOMY[];
export type TAXONONOMY_MAP =  {
	[key: string]: TAXONOMY;
}
export type TERM = {
	id: number;
	slug: string;
	label: string;
	taxonomy: number;
}
export type TERMS = TERM[];
export type TERM_MAP =  {
	[key: string]: TERM;
}
const taxonomyMap : TAXONONOMY_MAP = {
	urlslug :{
		id: 1,
		slug: 'urlslug',
		label: 'URL Slug',
		private:true
	},

	photo: {
		id: 2,
		slug: 'photo',
		label: 'Photo Type',
	}

}

const termMap : TERM_MAP = {
	gm: {
		id: 1,
		slug: 'gm',
		label: 'Good Morning Photos',
		taxonomy: 2,
	},
	dog: {
		id: 2,
		slug: 'dog',
		label: 'Dog Photos',
		taxonomy: 2,
	},
	flower: {
		id: 3,
		slug: 'flower',
		label: 'Flower Photos',
		taxonomy: 2,
	},
	tree: {
		id: 4,
		slug: 'tree',
		label: 'Tree Photos',
		taxonomy: 2,
	},
	leaf: {
		id: 5,
		slug: 'leaf',
		label: 'Leaf Photos',
		taxonomy: 2,
	},
}
