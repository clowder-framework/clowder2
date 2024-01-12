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
export type FolderOut = {
    name?: string;
    /**
     * MongoDB document ObjectID
     */
    id?: string;
    dataset_id: string;
    parent_folder?: string;
    creator: UserOut;
    created?: string;
    modified?: string;
}
