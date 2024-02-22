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
export type LicenseOut = {
    creator: string;
    created?: string;
    modified?: string;
    name: string;
    type: string;
    text: string;
    url: string;
    version: string;
    holders?: Array<UserOut>;
    expiration_date?: string;
    allow_download?: boolean;
    dataset_id: string;
    id?: string;
}
