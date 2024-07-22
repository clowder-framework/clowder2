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
 */
export type UserAPIKeyOut = {
    name: string;
    key: string;
    user: string;
    created?: string;
    expires?: string;
    /**
     * MongoDB document ObjectID
     */
    id?: string;
}
