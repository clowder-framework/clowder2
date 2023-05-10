/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RoleType } from './RoleType';

/**
 * The creator of the Authorization object should also be the creator of the dataset itself.
 */
export type AuthorizationDB = {
    dataset_id: string;
    user_ids?: Array<string>;
    role: RoleType;
    group_ids?: Array<string>;
    _id?: string;
}
