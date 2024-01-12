/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FeedListener } from './FeedListener';
import type { SearchObject } from './SearchObject';

/**
 * Document Mapping class.
 *
 * Fields:
 *
 * - `id` - MongoDB document ObjectID "_id" field.
 * Mapped to the PydanticObjectId class
 */
export type FeedOut = {
    name: string;
    search: SearchObject;
    listeners?: Array<FeedListener>;
    /**
     * MongoDB document ObjectID
     */
    id?: string;
    creator?: string;
    created?: string;
    modified?: string;
}
