/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FeedListener } from './FeedListener';
import type { SearchObject } from './SearchObject';
import type { UserOut } from './UserOut';

/**
 * A Job Feed is a saved set of search criteria with some number of Event Listeners that can be triggered when new
 * resources match the saved search criteria for the Feed.
 */
export type FeedOut = {
    id?: string;
    name: string;
    search: SearchObject;
    listeners?: Array<FeedListener>;
    author: UserOut;
    updated?: string;
}
