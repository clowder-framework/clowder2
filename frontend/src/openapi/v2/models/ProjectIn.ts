/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { app__models__project__Member } from './app__models__project__Member';
import type { UserOut } from './UserOut';

export type ProjectIn = {
    _id?: string;
    name: string;
    description?: string;
    created?: string;
    modified?: string;
    dataset_ids?: Array<string>;
    folder_ids?: Array<string>;
    file_ids?: Array<string>;
    creator: UserOut;
    users?: Array<app__models__project__Member>;
}
