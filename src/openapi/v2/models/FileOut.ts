/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserOut } from './UserOut';

export type FileOut = {
    id?: string;
    name?: string;
    creator: UserOut;
    created?: string;
    version?: string;
    dataset_id: string;
    folder_id?: string;
    views?: number;
    downloads?: number;
}
