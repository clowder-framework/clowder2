/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetadataField } from './MetadataField';
import type { MetadataRequiredForItems } from './MetadataRequiredForItems';
import type { UserOut } from './UserOut';

/**
 * Document Mapping class.
 *
 * Fields:
 *
 * - `id` - MongoDB document ObjectID "_id" field.
 * Mapped to the PydanticObjectId class
 */
export type MetadataDefinitionOut = {
    name: string;
    description?: string;
    required_for_items: MetadataRequiredForItems;
    created?: string;
    '@context'?: Array<string>;
    context_url?: string;
    fields: Array<MetadataField>;
    modified?: string;
    /**
     * MongoDB document ObjectID
     */
    id?: string;
    creator: UserOut;
}
