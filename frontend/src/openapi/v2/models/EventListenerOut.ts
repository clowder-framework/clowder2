/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccessList } from './AccessList';
import type { ExtractorInfo } from './ExtractorInfo';
import type { UserOut } from './UserOut';

/**
 * EventListeners have a name, version, author, description, and optionally properties where extractor_info will be saved.
 */
export type EventListenerOut = {
    name: string;
    version?: string;
    description?: string;
    access?: AccessList;
    id?: string;
    creator?: UserOut;
    created?: string;
    modified?: string;
    lastAlive?: string;
    alive?: boolean;
    active?: boolean;
    properties?: ExtractorInfo;
}
