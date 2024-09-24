
import { TabPanel, ToggleControl } from '@wordpress/components';
import React, { useState } from 'react';
import { Accounts, See } from '../types';
import { SearchGardern } from './SearchGarden';
import Timeline from './Timeline';
import TimelineViewToggles from './TimelineViewToggles';
import useDebouncedValue from './hooks/useDebouncedValue';

export default function Dashboard() {
    const [search,setSearch] = useDebouncedValue<string>('',300);
	const [see,setSee] = useState<See>('statuses');
	const [account,setAccount] = useState<Accounts>('mastodonSocial');
    const [searchMyPostsOnly, setSearchMyPostsOnly] = useState(true);
	function addBlockquote(content: string,citation: string) {
		console.log({
            content,citation
        })
	}
	function addParagraph(content: string) {
		console.log({
            content
        })
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
