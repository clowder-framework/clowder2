/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Repository } from './Repository';

export type ExtractorIdentifier = {
    id?: string;
    name: string;
    version?: string;
    updated?: string;
    author: string;
    contributors?: Array<string>;
    contexts?: Array<any>;
    repository?: Array<Repository>;
    external_services: Array<string>;
    libraries?: Array<string>;
    bibtex: Array<string>;
    maturity?: string;
    default_labels?: Array<string>;
    process: any;
    categories?: Array<string>;
    parameters?: any;
}
