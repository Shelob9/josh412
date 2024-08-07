
import { createBlock } from '@wordpress/blocks';
import { useDispatch } from '@wordpress/data';
import React, { useState } from 'react';
import { Accounts, See } from '../types';
import { SearchGardern } from './SearchGarden';
import Timeline, { TimelineViewToggles } from './Timeline';

export default function GardenSource({search,setSearch}) {
	const [see,setSee] = useState<See>('statuses');
	const [account,setAccount] = useState<Accounts>('mastodonSocial');
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
	return <>
        <SearchGardern
            search={search}
            onChangeSearch={(update) => setSearch({ search })}
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
	</>
}
