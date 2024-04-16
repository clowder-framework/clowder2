/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { AccessList } from './AccessList';

/**
 * On submission, minimum info for a listener is name, version and description. Clowder will use name and version to locate queue.
 */
export type EventListenerIn = {
    name: string;
    version?: string;
    description?: string;
    access?: AccessList;
}
