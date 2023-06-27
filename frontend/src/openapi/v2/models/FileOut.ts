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
 *
 * Inherited from:
 *
 * - Pydantic BaseModel
 * - [UpdateMethods](https://roman-right.github.io/beanie/api/interfaces/#aggregatemethods)
 */
export type FileOut = {
    name?: string;
    id?: string;
    creator: UserOut;
    created?: string;
    version_id?: string;
    version_num?: number;
    dataset_id: string;
    folder_id?: string;
    views?: number;
    downloads?: number;
    bytes?: number;
    content_type?: ContentType;
}
