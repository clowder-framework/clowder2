/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RoleType } from './RoleType';

/**
 * Store user who created model, when and last time it was updated.
 * TODO: this generic model should be moved to a global util module in models for all those models that want to
 * store basic provenance.
 */
export type AuthorizationDB = {
    creator: string;
    created?: string;
    modified?: string;
    dataset_id: string;
    user_id: string;
    role: RoleType;
    id?: string;
}
