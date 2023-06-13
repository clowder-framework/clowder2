/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MongoDBRef } from './MongoDBRef';
import type { UserOut } from './UserOut';

/**
 * This summarizes a submission to an extractor. All messages from that extraction should include this job's ID.
 */
export type EventListenerJobOut = {
    listener_id: string;
    resource_ref: MongoDBRef;
    creator: UserOut;
    parameters?: any;
    created?: string;
    started?: string;
    updated?: string;
    finished?: string;
    duration?: number;
    latest_message?: string;
    status?: string;
    id?: string;
}
