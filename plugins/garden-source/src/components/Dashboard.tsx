
import { SelectControl, TabPanel, ToggleControl } from '@wordpress/components';
import React, { useState } from 'react';
import { accountOptions } from '../accounts';
import { Accounts, See } from '../types';
import useDebouncedValue from './hooks/useDebouncedValue';
import Injest from './Injest';
import { SearchGardern } from './SearchGarden';
import Timeline from './Timeline';
import TimelineViewToggles from './TimelineViewToggles';

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
                        name:'items',
                        title: 'Items',
                        className: 'items-tab',
                    },
                    {
                        name: 'injest',
                        title: 'Injest',
                        className: 'injest-tab',
                    },
                ] }
            >
                { ( tab ) => {
                    switch (tab.name) {
                        case 'timeline':
                               return (
                                    <>
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
                                        />: <TimelineViewToggles
                                            see={see}
                                            onChangeSee={(see) => setSee(see as See)}
                                            account={account}
                                            onChangeAccount={(update) => setAccount(update)}
                                        />}
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
                               )
                            break;
                            case"items":
                                return (
                                    <div>
                                    <SelectControl
                                        label="Account"
                                        value={account}
                                        options={accountOptions}
                                        onChange={(update) => setAccount(update as Accounts)}
                                    />
                                    Items

                                </div>
                                )
                        case 'injest':
                        default:
                            return <>
                                <div>
                                    <SelectControl
                                        label="Account"
                                        value={account}
                                        options={accountOptions}
                                        // @ts-ignore
                                        onChange={(update) => setAccount(update)}
                                    />
                                    <Injest
                                        account={account}
                                    />

                                </div>
                            </>
                    }
                } }
            </TabPanel>


        </>

    )
}
