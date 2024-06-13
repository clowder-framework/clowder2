/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FeedListener } from './FeedListener';
import type { SearchObject } from './SearchObject';

/**
 * A Job Feed is a saved set of search criteria with some number of Event Listeners that can be triggered when new
 * resources match the saved search criteria for the Feed.
 */
export type FeedIn = {
    name: string;
    description?: string;
    search: SearchObject;
    listeners?: Array<FeedListener>;
}
