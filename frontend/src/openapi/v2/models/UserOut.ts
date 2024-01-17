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
export type UserOut = {
    email: string;
    first_name: string;
    last_name: string;
    /**
     * MongoDB document ObjectID
     */
    id?: string;
    admin: boolean;
    admin_mode?: boolean;
}
