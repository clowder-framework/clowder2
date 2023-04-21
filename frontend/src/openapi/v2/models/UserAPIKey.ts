/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

/**
 * API keys can have a reference name (e.g. 'Uploader script')
 */
export type UserAPIKey = {
    id?: string;
    key: string;
    name: string;
    user: string;
    created?: string;
    expires?: string;
}
