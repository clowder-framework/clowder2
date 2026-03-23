/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type License = {
    licenseType: string;
    rightsHolder: string;
    licenseUrl: string;
    licenseText: License.licenseText;
    allowDownload: string;
}

export namespace License {

    export enum licenseText {
        BY_NC_ND = 'by-nc-nd',
        BY_ND = 'by-nd',
        BY_NC = 'by-nc',
        BY_NC_SA = 'by-nc-sa',
        BY_SA = 'by-sa',
        BY = 'by',
    }


}
