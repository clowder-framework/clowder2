/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Dataset = {
    id?: string;
    name?: string;
    author?: string;
    description?: string;
    created?: string;
    modified?: string;
    files?: Array<string>;
    folders?: Array<string>;
    status?: string;
    views?: number;
    downloads?: number;
}
