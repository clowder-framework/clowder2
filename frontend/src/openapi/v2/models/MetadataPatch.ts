/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExtractorIn } from './ExtractorIn';

export type MetadataPatch = {
    id?: string;
    context?: any;
    context_url?: string;
    definition?: string;
    contents: any;
    file_version?: number;
    extractor_info?: ExtractorIn;
    metadata_id?: string;
}
