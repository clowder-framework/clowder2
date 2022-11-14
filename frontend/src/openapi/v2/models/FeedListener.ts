/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * This is a shorthand POST class for associating an existing EventListener with a Feed. The automatic flag determines
 * whether the Feed will automatically send new matches to the Event Listener.
 */
export type FeedListener = {
    listener_id: string;
    automatic: boolean;
}
