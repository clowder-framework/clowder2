/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventListenerOut } from './EventListenerOut';
import type { FileOut } from './FileOut';
import type { UserOut } from './UserOut';

export type ExecutionLogs = {
    id: string;
    file_id: string;
    dataset_id?: string;
    job_id: string;
    extractor_id: string;
    status: string;
    start: string;
    user_id: string;
    file?: FileOut;
    user?: UserOut;
    listener?: EventListenerOut;
}
