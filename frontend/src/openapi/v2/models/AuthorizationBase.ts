/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { RoleType } from "./RoleType";

/**
 * Currently, user_ids list is used for primary authorization checks.
 * group_ids are kept for convenience (adding/removing users in batch) but user_ids list MUST be kept current.
 */
export type AuthorizationBase = {
	dataset_id: string;
	user_ids?: Array<string>;
	role: RoleType;
	group_ids?: Array<string>;
};
