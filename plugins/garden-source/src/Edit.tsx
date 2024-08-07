
import { useBlockProps } from '@wordpress/block-editor';
import React from 'react';
import GardenSource from './components/GardenSource';
import './editor.scss';

export default function Edit({ attributes, setAttributes}) {

		return (
		<div { ...useBlockProps() }>
			<GardenSource
				search={attributes.search}
				setSearch={(update) => setAttributes({ search: update })}
			/>
		</div>
	);
}
