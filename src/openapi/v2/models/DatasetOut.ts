/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { UserOut } from './UserOut';

export type DatasetOut = {
    name?: string;
    description?: string;
    id?: string;
    author: UserOut;
    created?: string;
    modified?: string;
    files?: Array<string>;
    folders?: Array<string>;
    status?: string;
    views?: number;
    downloads?: number;
}
