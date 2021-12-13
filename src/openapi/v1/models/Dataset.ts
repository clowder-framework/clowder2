/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Dataset = {
    name: string;
    description?: string;
    access?: Dataset.access;
    /**
     * if space is not set or set as default, this dataset will not be add to any Spaces.
     */
    space?: Array<string>;
    /**
     * if collection is not set or set as default, this dataset will not be add to any Collections.
     */
    collection?: Array<string>;
    /**
     * the list of file ids, seperated with comma
     */
    existingfiles?: string;
}

export namespace Dataset {

    export enum access {
        PUBLIC = 'PUBLIC',
        PRIVATE = 'PRIVATE',
        DEFAULT = 'DEFAULT',
        TRIAL = 'TRIAL',
    }


}
