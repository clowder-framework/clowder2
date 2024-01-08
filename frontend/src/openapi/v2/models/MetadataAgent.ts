/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventListenerOut } from './EventListenerOut';
import type { UserOut } from './UserOut';

/**
 * Describes the user who created a piece of metadata. If listener is provided, user refers to the user who
 * triggered the job.
 */
export type MetadataAgent = {
    creator: UserOut;
    listener?: EventListenerOut;
}
