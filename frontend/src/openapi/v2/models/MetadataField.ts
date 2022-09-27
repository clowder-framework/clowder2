/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetadataConfig } from './MetadataConfig';
import type { MetadataEnumConfig } from './MetadataEnumConfig';

export type MetadataField = {
    id?: string;
    name: string;
    list?: boolean;
    widgetType?: string;
    config: (MetadataEnumConfig | MetadataConfig);
    required?: boolean;
}
