/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ContentType } from './ContentType';
import type { UserOut } from './UserOut';

/**
 * Document Mapping class.
 *
 * Fields:
 *
 * - `id` - MongoDB document ObjectID "_id" field.
 * Mapped to the PydanticObjectId class
 */
export type ThumbnailOut = {
    /**
     * MongoDB document ObjectID
     */
    id?: string;
    creator: UserOut;
    created?: string;
    modified?: string;
    bytes?: number;
    content_type?: ContentType;
    downloads?: number;
}
