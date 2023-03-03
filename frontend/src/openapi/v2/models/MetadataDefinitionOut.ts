/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { MetadataField } from './MetadataField';
import type { UserOut } from './UserOut';

/**
 * This describes a metadata object with a short name and description, predefined set of fields, and context.
 * These provide a shorthand for use by listeners as well as a source for building GUI widgets to add new entries.
 *
 * Example: {
     * "name" : "LatLon",
     * "description" : "A set of Latitude/Longitude coordinates",
     * "context" : [
         * {
             * "longitude" : "https://schema.org/longitude",
             * "latitude" : "https://schema.org/latitude"
             * },
             * ],
             * "fields" : [
                 * {
                     * "name" : "longitude",
                     * "list" : false,
                     * "widgetType": "TextField",
                     * "config": {
                         * "type" : "float"
                         * },
                         * "required" : true
                         * },
                         * {
                             * "name" : "latitude",
                             * "list" : false,
                             * "widgetType": "TextField",
                             * "config": {
                                 * "type" : "float"
                                 * },
                                 * "required" : true
                                 * }
                                 * ]
                                 * }
                                 */
                                export type MetadataDefinitionOut = {
                                    id?: string;
                                    name: string;
                                    description?: string;
                                    context?: Array<string>;
                                    context_url?: string;
                                    fields: Array<MetadataField>;
                                    creator: UserOut;
                                }
