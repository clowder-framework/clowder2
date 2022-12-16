/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * On submission, minimum info for a listener is name, version and description. Clowder will use name and version to locate queue.
 */
export type EventListenerIn = {
    author?: string;
    name: string;
    version?: string;
    description?: string;
}
