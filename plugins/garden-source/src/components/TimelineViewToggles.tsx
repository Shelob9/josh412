import React, { useMemo } from "react";
import { TimelineProps } from "./Timeline";

import {
    SelectControl
} from '@wordpress/components';
import { accountOptions } from "../accounts";
export default function TimelineViewToggles({
    account,
    see,
    onChangeSee,
    onChangeAccount,

}:Omit<TimelineProps,'search'> ){
    const seeOptions = useMemo(() => {
        if( 'bluesky' === account ){
            return ['statuses', 'likes'];
        }
        return ['statuses', 'likes', 'timeline']
    }, [account]);
    return (
        <div>
            <div>
                <SelectControl
                    label="Account"
                    value={account}
                    options={accountOptions}
                    // @ts-ignore
                    onChange={(update) => onChangeAccount(update)}
                />

            </div>
            <div>
                <SelectControl
                    label="See"
                    value={see}
                    options={seeOptions.map((value) => ({
                        label: value,
                        value,
                    }))}
                    onChange={(update) => onChangeSee(update as 'posts'|'likes'|'timeline')}
                />
            </div>
        </div>
    );
}
