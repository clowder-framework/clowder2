/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetadataField } from './MetadataField';

/**
 * This describes a metadata object with a short name and description, predefined set of fields, and context.
 * These provide a shorthand for use by extractors as well as a source for building GUI widgets to add new entries.
 *
 * Example: {
     * "name": "LatLon",
     * "description": "A set of Latitude/Longitude coordinates",
     * "context": {
         * "longitude": "https://schema.org/longitude",
         * "latitude": "https://schema.org/latitude"
         * },
         * "fields": [{
             * "name": "longitude",
             * "type": "float",
             * "required": "True"
             * },{
                 * "name": "latitude",
                 * "type": "float",
                 * "required": "True"
                 * }]
                 * }
                 */
                export type MetadataDefinitionIn = {
                    id?: string;
                    name: string;
                    description?: string;
                    context?: any;
                    context_url?: string;
                    fields: Array<MetadataField>;
                }
