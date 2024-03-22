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
export type LicenseOut = {
    creator: string;
    created?: string;
    modified?: string;
    name: string;
    description?: string;
    url?: string;
    version?: string;
    holders?: string;
    expiration_date?: string;
    id?: string;
}
