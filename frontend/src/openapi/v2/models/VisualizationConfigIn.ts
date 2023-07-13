/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventListenerJobDB } from './EventListenerJobDB';
import type { ExtractorInfo } from './ExtractorInfo';
import type { MongoDBRef } from './MongoDBRef';

export type VisualizationConfigIn = {
    resource: MongoDBRef;
    extractor_info?: ExtractorInfo;
    job?: EventListenerJobDB;
    client?: string;
    parameters?: any;
    visualization_bytes_ids: Array<string>;
    visualization_mimetype: string;
    visualization_component_id: string;
}
