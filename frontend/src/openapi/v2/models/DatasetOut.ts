/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserOut } from './UserOut';

/**
 * Document Mapping class.
 *
 * Fields:
 *
 * - `id` - MongoDB document ObjectID "_id" field.
 * Mapped to the PydanticObjectId class
 */
export type DatasetOut = {
    name?: string;
    description?: string;
    /**
     * MongoDB document ObjectID
     */
    id?: string;
    creator: UserOut;
    created?: string;
    modified?: string;
    status?: string;
    user_views?: number;
    downloads?: number;
    thumbnail_id?: string;
}
