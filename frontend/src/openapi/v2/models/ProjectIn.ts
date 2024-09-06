/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { ProjectMember } from './ProjectMember';
import type { UserOut } from './UserOut';

export type ProjectIn = {
    creator: UserOut;
    created?: string;
    name: string;
    description?: string;
    users?: Array<ProjectMember>;
    dataset_ids?: Array<string>;
}
