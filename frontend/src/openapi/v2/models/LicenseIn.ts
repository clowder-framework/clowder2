/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserOut } from './UserOut';

export type LicenseIn = {
    name: string;
    type: string;
    text: string;
    url: string;
    version: string;
    holders?: Array<UserOut>;
    expiration_date?: string;
    allow_download?: boolean;
    dataset_id: string;
}
