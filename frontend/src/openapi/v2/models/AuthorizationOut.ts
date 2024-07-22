/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RoleType } from './RoleType';

/**
 * The creator of the Authorization object should also be the creator of the dataset itself.
 */
export type AuthorizationOut = {
    creator: string;
    created?: string;
    modified?: string;
    dataset_id: string;
    user_ids?: Array<string>;
    role: RoleType;
    group_ids?: Array<string>;
    /**
     * MongoDB document ObjectID
     */
    id?: string;
}
