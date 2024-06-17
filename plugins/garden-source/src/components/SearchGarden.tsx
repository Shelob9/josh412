import { TextControl } from '@wordpress/components';
import React from 'react';

export function SearchGardern({
    search,
    onChangeSearch
}: {
    search: string;
    onChangeSearch: (update: string) => void;
}){
    return (
        <div>
            <TextControl
                type="text"
                onChange={(update) => onChangeSearch(update)}
                value={search}
                label="Search"
            />
        </div>
    );
}
