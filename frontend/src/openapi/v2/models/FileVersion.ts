/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { FileContentType } from './FileContentType';
import type { UserOut } from './UserOut';

export type FileVersion = {
    id?: string;
    version_id: string;
    version_num?: number;
    file_id: string;
    creator: UserOut;
    bytes?: number;
    content_type?: FileContentType;
    created?: string;
}
