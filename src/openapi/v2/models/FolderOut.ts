/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserOut } from './UserOut';

export type FolderOut = {
    id?: string;
    name?: string;
    dataset_id: string;
    parent_folder?: string;
    author: UserOut;
    created?: string;
    modified?: string;
}
