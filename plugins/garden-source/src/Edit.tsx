
import { useBlockProps } from '@wordpress/block-editor';
import React, { useState } from 'react';
import { SearchGardern } from './components/SearchGarden';
import Timeline, { TimelineViewToggles } from './components/Timeline';
import './editor.scss';
import { Accounts, See } from './types';

export default function Edit({ attributes, setAttributes}) {
	const [see,setSee] = useState<See>('posts');
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
						onChangeSee={(see) => setSee(see)}
						account={account}
						onChangeAccount={(update) => setAccount(update)}
					/>
				</div>
				<div>

					<Timeline see={see} account={account} />
				</div>
			</div>
		</div>
	);
}
