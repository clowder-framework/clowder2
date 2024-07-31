/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

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
export type UserOut = {
    email: string;
    first_name: string;
    last_name: string;
    id?: string;
    admin?: boolean;
    admin_mode?: boolean;
    read_only_user?: boolean;
}
