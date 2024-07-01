/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetadataAgent } from './MetadataAgent';
import type { MongoDBRef } from './MongoDBRef';

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
export type MetadataOut = {
    '@context'?: Array<string>;
    context_url?: string;
    definition?: string;
    content: any;
    description?: string;
    resource: MongoDBRef;
    agent: MetadataAgent;
    created?: string;
    origin_id?: string;
    id?: string;
    frozen?: boolean;
}
