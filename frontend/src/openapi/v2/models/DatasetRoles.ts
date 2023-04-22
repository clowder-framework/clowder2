/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { GroupAndRole } from './GroupAndRole';
import type { UserAndRole } from './UserAndRole';

export type DatasetRoles = {
    id?: string;
    dataset_id: string;
    user_roles?: Array<UserAndRole>;
    group_roles?: Array<GroupAndRole>;
}
