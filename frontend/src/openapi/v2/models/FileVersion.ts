/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserOut } from './UserOut';

export type FileVersion = {
    id?: string;
    version_id?: string;
    file_id: string;
    creator: UserOut;
    created?: string;
}
