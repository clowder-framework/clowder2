/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { EventListenerIn } from "./EventListenerIn";
import type { LegacyEventListenerIn } from "./LegacyEventListenerIn";

export type MetadataDelete = {
	metadata_id?: string;
	definition?: string;
	listener?: EventListenerIn;
	extractor?: LegacyEventListenerIn;
};
