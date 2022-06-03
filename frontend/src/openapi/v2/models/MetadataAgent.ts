/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExtractorOut } from './ExtractorOut';
import type { UserOut } from './UserOut';

/**
 * Describes the user who created a piece of metadata. If extractor is provided, user refers to the user who
 * triggered the extraction.
 */
export type MetadataAgent = {
    id?: string;
    creator: UserOut;
    extractor?: ExtractorOut;
}
