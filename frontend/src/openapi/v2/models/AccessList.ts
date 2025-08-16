/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * Container object for lists of user emails/group IDs/dataset IDs that can submit to listener.
 * The singular owner is the primary who can modify other lists.
 */
export type AccessList = {
    owner: string;
    users?: Array<string>;
    groups?: Array<string>;
    datasets?: Array<string>;
}
