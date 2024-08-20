import {
    Button,
    __experimentalHStack as HStack,
    TextControl,
} from '@wordpress/components';
import React from 'react';

export function SearchGardern({
    search,
    onChangeSearch
}: {
    search: string;
    onChangeSearch: (update: string) => void;
}){
    return (
        <HStack>
            <TextControl
                type="text"
                onChange={(update) => onChangeSearch(update)}
                value={search}
                label="Search"
            />
            <Button
                onClick={() => onChangeSearch('')}
            >
                Reset
            </Button>
        </HStack>
    );
}
