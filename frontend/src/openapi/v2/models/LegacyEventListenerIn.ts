/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Repository } from './Repository';

/**
 * v1 Extractors can submit data formatted as a LegacyEventListener (i.e. v1 format) and it will be converted to a v2 EventListener.
 */
export type LegacyEventListenerIn = {
    author?: string;
    process?: any;
    maturity?: string;
    name: string;
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
    description?: string;
}
