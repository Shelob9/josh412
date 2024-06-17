
import { registerBlockType } from '@wordpress/blocks';


import './style.scss';


import metadata from './block.json';
import Edit from './Edit';
registerBlockType( metadata.name, {
	edit: Edit,
} );
