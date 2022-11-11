/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Repository } from './Repository';

/**
 * Currently for extractor_info JSON from Clowder v1 extractors for use with to /api/extractors endpoint.
 */
export type ExtractorInfo = {
    author: string;
    process: any;
    maturity?: string;
    contributors?: Array<string>;
    contexts?: Array<any>;
    repository?: Array<Repository>;
    external_services?: Array<string>;
    libraries?: Array<string>;
    bibtex?: Array<string>;
    default_labels?: Array<string>;
    categories?: Array<string>;
    parameters?: Array<any>;
}
