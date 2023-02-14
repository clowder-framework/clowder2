/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileContentType } from './FileContentType';
import type { UserOut } from './UserOut';

export type FileOut = {
    id?: string;
    name?: string;
    creator: UserOut;
    created?: string;
    version_id?: string;
    version_num?: number;
    dataset_id: string;
    folder_id?: string;
    views?: number;
    downloads?: number;
    bytes?: number;
    content_type?: FileContentType;
}
