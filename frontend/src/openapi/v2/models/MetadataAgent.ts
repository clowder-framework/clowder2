/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExtractorOut } from './ExtractorOut';
import type { UserOut } from './UserOut';

export type MetadataAgent = {
    id?: string;
    creator: UserOut;
    extractor?: ExtractorOut;
}
