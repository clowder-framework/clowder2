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
    dataset_id: string;
    parent_folder?: string;
    creator: UserOut;
    created?: string;
    modified?: string;
    object_type?: string;
    origin_id?: string;
    /**
     * MongoDB document ObjectID
     */
    id?: string;
    frozen?: boolean;
}
