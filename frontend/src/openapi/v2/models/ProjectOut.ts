/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProjectMember } from './ProjectMember';
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
    creator: UserOut;
    created?: string;
    name: string;
    description?: string;
    users?: Array<ProjectMember>;
    dataset_ids?: Array<string>;
    id?: string;
}
