
import { useBlockProps } from '@wordpress/block-editor';
import { createBlock } from '@wordpress/blocks';
import { useDispatch } from '@wordpress/data';
import React, { useState } from 'react';
import { SearchGardern } from './components/SearchGarden';
import Timeline, { TimelineViewToggles } from './components/Timeline';
import './editor.scss';
import { Accounts, See } from './types';


export default function Edit({ attributes, setAttributes}) {
	const { insertBlocks } = useDispatch( 'core/block-editor' );
	function addBlockquote(content: string,citation: string) {
		const block = createBlock( 'core/quote', {
			value:content,
			citation,
		} );
		insertBlocks( block );
	}
	function addParagraph(content: string) {
		const block = createBlock( 'core/paragraph', {
			content,
		} );
		insertBlocks( block );
	}
	const [see,setSee] = useState<See>('statuses');
	const [account,setAccount] = useState<Accounts>('mastodonSocial');
	return (
		<div { ...useBlockProps() }>
			<SearchGardern
				search={attributes.search}
				onChangeSearch={(search) => setAttributes({ search })}
			/>
			<div>
				<div>
					<TimelineViewToggles
						see={see}
						onChangeSee={(see) => setSee(see as See)}
						account={account}
						onChangeAccount={(update) => setAccount(update)}
					/>
				</div>
				<div>

					<Timeline see={see} account={account}
						onCopy={(content) => addParagraph(content)}
						onQuote={(content,citation) => addBlockquote(content,citation)}

						onChangeAccount={setAccount} />
				</div>
			</div>
		</div>
	);
}
