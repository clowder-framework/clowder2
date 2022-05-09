/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { DBRef } from './DBRef';
import type { MetadataAgent } from './MetadataAgent';

export type MetadataOut = {
    id?: string;
    context?: any;
    context_url?: string;
    definition?: string;
    contents: any;
    file?: string;
    file_version?: string;
    dataset?: string;
    resource: DBRef;
    agent: MetadataAgent;
    created?: string;
}
