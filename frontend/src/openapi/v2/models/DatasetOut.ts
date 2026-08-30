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
export type DatasetOut = {
    name?: string;
    description?: string;
    status?: string;
    creator: UserOut;
    created?: string;
    modified?: string;
    user_views?: number;
    downloads?: number;
    thumbnail_id?: string;
    origin_id?: string;
    standard_license?: boolean;
    license_id?: string;
    doi?: string;
    id?: string;
    frozen?: boolean;
    frozen_version_num?: number;
    deleted?: boolean;
}
