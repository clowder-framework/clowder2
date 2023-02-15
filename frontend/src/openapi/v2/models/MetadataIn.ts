/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventListenerIn } from './EventListenerIn';
import type { ExtractorInfo } from './ExtractorInfo';
import type { LegacyEventListenerIn } from './LegacyEventListenerIn';

export type MetadataIn = {
    id?: string;
    context?: any;
    context_url?: string;
    definition?: string;
    content: any;
    file_version?: number;
    listener?: EventListenerIn;
    extractor?: LegacyEventListenerIn;
    extractor_info?: ExtractorInfo;
}
