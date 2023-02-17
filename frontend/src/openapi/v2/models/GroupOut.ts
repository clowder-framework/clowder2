/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Member } from './Member';
import type { UserOut } from './UserOut';

export type GroupOut = {
    name?: string;
    description?: string;
    userList?: Array<Member>;
    id?: string;
    author: UserOut;
    created?: string;
    modified?: string;
    views?: number;
}
