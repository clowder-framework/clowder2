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
 *
 * Inherited from:
 *
 * - Pydantic BaseModel
 * - [UpdateMethods](https://roman-right.github.io/beanie/api/interfaces/#aggregatemethods)
 */
export type FeedOut = {
    creator: string;
    created?: string;
    modified?: string;
    name: string;
    search: SearchObject;
    listeners?: Array<FeedListener>;
    _id?: string;
}
