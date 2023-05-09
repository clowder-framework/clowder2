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
 *
 * Inherited from:
 *
 * - Pydantic BaseModel
 * - [UpdateMethods](https://roman-right.github.io/beanie/api/interfaces/#aggregatemethods)
 */
export type FolderOut = {
    _id?: string;
    name?: string;
    dataset_id: string;
    parent_folder?: string;
    author: UserOut;
    created?: string;
    modified?: string;
}
