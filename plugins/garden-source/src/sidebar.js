import {
    PanelBody
} from '@wordpress/components';
import { PluginSidebar } from '@wordpress/editor';
import { registerPlugin } from '@wordpress/plugins';
import { useState } from 'react';
import metadata from './block.json';
import GardenSource from './components/GardenSource';

// Register the plugin.
registerPlugin( 'garden-source-bar', {
	render: function () {
        const [search,setSearch] = useState('');
		return <>
            <PluginSidebar
                name={ 'garden-source-bar' }
                icon={metadata.icon}
                title={ 'Garden Source' }
            >

                <PanelBody>
                    <GardenSource
                        search={search}
                        setSearch={(update) => setSearch(update)}
                    />
                </PanelBody>
            </PluginSidebar>
		</>
	},
})
