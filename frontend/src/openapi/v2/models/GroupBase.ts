/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Member } from './Member';

export type GroupBase = {
    name: string;
    description?: string;
    users?: Array<Member>;
}
