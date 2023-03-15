/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetadataAgent } from './MetadataAgent';
import type { MongoDBRef } from './MongoDBRef';

export type MetadataOut = {
    id?: string;
    context?: Array<string>;
    context_url?: string;
    definition?: string;
    content: any;
    resource: MongoDBRef;
    agent: MetadataAgent;
    created?: string;
    description?: string;
}
