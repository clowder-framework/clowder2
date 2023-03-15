/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RoleType } from './RoleType';

export type AuthorizationFile = {
    file_id: string;
    user_ids?: Array<string>;
    role: RoleType;
    group_ids?: Array<string>;
}
