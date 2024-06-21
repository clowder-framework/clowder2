/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { SearchCriteria } from './SearchCriteria';

/**
 * This is a way to save a search (i.e. as a Feed).
 *
 * Parameters:
 * criteria -- some number of field/operator/value tuples describing the search requirements
 * mode -- and/or determines whether all of the criteria must match, or any of them
 * original -- if the user originally performed a string search, their original text entry is preserved here
 */
export type SearchObject = {
    criteria?: Array<SearchCriteria>;
    mode?: string;
    original?: string;
}
