/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Repository } from './Repository';

/**
 * Currently for extractor_info JSON from Clowder v1 extractors for use with to /api/extractors endpoint.
 */
export type ExtractorInfo = {
    author?: string;
    process?: any;
    maturity?: string;
    name?: string;
    contributors?: Array<string>;
    contexts?: Array<string>;
    repository?: Array<Repository>;
    external_services?: Array<string>;
    libraries?: Array<string>;
    bibtex?: Array<string>;
    default_labels?: Array<string>;
    categories?: Array<string>;
    parameters?: any;
    version?: string;
    unique_key?: string;
}
