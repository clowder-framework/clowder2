/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RoleType } from './RoleType';

export type AuthorizationBase = {
    dataset_id: string;
    user_id: string;
    role: RoleType;
}
