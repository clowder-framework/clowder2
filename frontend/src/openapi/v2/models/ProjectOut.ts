/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { app__models__project__Member } from './app__models__project__Member';
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
export type ProjectOut = {
    id?: string;
    name: string;
    description?: string;
    created?: string;
    modified?: string;
    dataset_ids?: Array<string>;
    folder_ids?: Array<string>;
    file_ids?: Array<string>;
    creator: UserOut;
    users?: Array<app__models__project__Member>;
}
