/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Member } from './Member';

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
export type GroupOut = {
    creator: string;
    created?: string;
    modified?: string;
    name: string;
    description?: string;
    users?: Array<Member>;
    _id?: string;
    views?: number;
}
