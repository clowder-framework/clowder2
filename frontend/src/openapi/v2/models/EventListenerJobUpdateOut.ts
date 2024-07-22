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
export type EventListenerJobUpdateOut = {
    job_id: string;
    timestamp?: string;
    status: string;
    /**
     * MongoDB document ObjectID
     */
    id?: string;
}
