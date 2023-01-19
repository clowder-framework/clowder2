/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventListenerIn } from './EventListenerIn';
import type { ExtractorInfo } from './ExtractorInfo';
import type { LegacyEventListenerIn } from './LegacyEventListenerIn';

export type MetadataDelete = {
    id?: string;
    metadata_id?: string;
    definition?: string;
    listener?: EventListenerIn;
    extractor?: LegacyEventListenerIn;
    extractor_info?: ExtractorInfo;
}
