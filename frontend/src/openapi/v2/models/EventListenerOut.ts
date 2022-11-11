/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExtractorInfo } from './ExtractorInfo';
import type { UserOut } from './UserOut';

/**
 * EventListeners have a name, version, author, description, and optionally properties where extractor_info will be saved.
 */
export type EventListenerOut = {
    id?: string;
    name: string;
    version?: string;
    description?: string;
    creator?: UserOut;
    created?: string;
    modified?: string;
    properties?: ExtractorInfo;
}
