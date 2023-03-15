/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Member } from './Member';

/**
 * Store user who created model, when and last time it was updated.
 * TODO: this generic model should be moved to a global util module in models for all those models that want to
 * store basic provenance.
 */
export type GroupOut = {
    creator: string;
    created?: string;
    modified?: string;
    name: string;
    description?: string;
    users?: Array<Member>;
    id?: string;
    views?: number;
}
