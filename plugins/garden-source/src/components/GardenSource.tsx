
import { createBlock } from '@wordpress/blocks';
import { TabPanel, ToggleControl } from '@wordpress/components';
import { useDispatch } from '@wordpress/data';
import React, { useState } from 'react';
import { Accounts, See } from '../types';
import Items from './Items';
import { SearchGardern } from './SearchGarden';
import Timeline from './Timeline';
import TimelineViewToggles from './TimelineViewToggles';

export default function GardenSource({search,setSearch}) {
	const [see,setSee] = useState<See>('statuses');
	const [account,setAccount] = useState<Accounts>('mastodonSocial');
	const { insertBlocks } = useDispatch( 'core/block-editor' );
    const [searchMyPostsOnly, setSearchMyPostsOnly] = useState(true);

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
    //when account changes, reset search
    React.useEffect(() => {
        setSearch('');
    }, [account]);
	return (
        <>
            <section>

                <TimelineViewToggles
                        see={see}
                        onChangeSee={(see) => setSee(see as See)}
                        account={account}
                        onChangeAccount={(update) => setAccount(update)}
                />

            </section>
            <TabPanel
                className="my-tab-panel"
                activeClass="active-tab"
                tabs={ [
                    {
                        name: 'timeline',
                        title: 'Timeline',
                        className: 'timeline-tab',
                    },
                    {
                        name: 'search',
                        title: 'Search',
                        className: 'search-tab',
                    },
                    {
                        name: 'items',
                        title: 'Items',
                        className: 'items-tab',
                    }
                ] }
            >
                { ( tab ) => {
                    switch (tab.name) {
                        case 'timeline':
                               return <Timeline
                                    see={see}
                                    search={''}
                                    account={account}
                                    onCopy={(content) => addParagraph(content)}
                                    onQuote={(content,citation) => addBlockquote(content,citation)}
                                    onChangeAccount={setAccount}
                                    searchMyPostsOnly={searchMyPostsOnly}
                                />
                            break;
                        case 'items':
                            return <Items
                                    account={account}
                                    onCopy={(content) => addParagraph(content)}
                                    onQuote={(content,citation) => addBlockquote(content,citation)}
                               />

                        default:
                            return <>
                                <SearchGardern
                                    search={search}
                                    onChangeSearch={(update) => {
                                        setSearch(update)
                                    }}
                                />
                                {search ?
                                <ToggleControl
                                    checked={searchMyPostsOnly}
                                    onChange={() =>  setSearchMyPostsOnly(!searchMyPostsOnly)}
                                    label="Search my posts only"
                                />: null}
                                <Timeline
                                    see={see}
                                    search={search}
                                    account={account}
                                    onCopy={(content) => addParagraph(content)}
                                    onQuote={(content,citation) => addBlockquote(content,citation)}
                                    onChangeAccount={setAccount}
                                    searchMyPostsOnly={searchMyPostsOnly}
                                />
                            </>
                    }
                } }
            </TabPanel>


        </>

    )
}
