/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetadataAgent } from './MetadataAgent';
import type { MongoDBRef } from './MongoDBRef';

export type MetadataOut = {
    id?: string;
    context?: any;
    context_url?: string;
    definition?: string;
    contents: any;
    resource: MongoDBRef;
    agent: MetadataAgent;
    created?: string;
}
