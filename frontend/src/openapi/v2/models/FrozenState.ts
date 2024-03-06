/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * A user can have one of the following roles for a specific dataset. Since we don't currently implement permissions
 * there is an implied hierarchy between these roles OWNER > EDITOR > UPLOADER > VIEWER. For example, if a route
 * requires VIEWER any of the roles can access that resource.
 */
export enum FrozenState {
    FROZEN = 'frozen',
    FROZEN_DRAFT = 'frozen_draft',
    ACTIVE = 'active',
}