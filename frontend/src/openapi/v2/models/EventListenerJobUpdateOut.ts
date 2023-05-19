/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExtractorInfo } from './ExtractorInfo';
import type { UserOut } from './UserOut';

/**
 * EventListeners have a name, version, author, description, and optionally properties where extractor_info will be saved.
 */
export type EventListenerJobUpdateOut = {
    name: string;
    version?: string;
    description?: string;
    id?: string;
    creator?: UserOut;
    created?: string;
    modified?: string;
    properties?: ExtractorInfo;
}
