/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ExtractorIn } from './ExtractorIn';
import type { MetadataIn } from './MetadataIn';

export type Body_add_metadata_api_v2_files__file_id__metadata_post = {
    in_metadata: MetadataIn;
    file_version?: number;
    extractor_info?: ExtractorIn;
}
