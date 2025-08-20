/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LicenseOption } from '../models/LicenseOption';
import type { LicenseOut } from '../models/LicenseOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicLicensesService {

    /**
     * Get License
     * @param licenseId
     * @returns LicenseOut Successful Response
     * @throws ApiError
     */
    public static getLicenseApiV2PublicLicensesLicenseIdGet(
        licenseId: string,
    ): CancelablePromise<LicenseOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_licenses/${licenseId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Standard Licenses
     * @returns LicenseOption Successful Response
     * @throws ApiError
     */
    public static getStandardLicensesApiV2PublicLicensesStandardLicensesAllGet(): CancelablePromise<Array<LicenseOption>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_licenses/standard_licenses/all`,
        });
    }

    /**
     * Get Standard License Url
     * @param licenseId
     * @returns string Successful Response
     * @throws ApiError
     */
    public static getStandardLicenseUrlApiV2PublicLicensesStandardLicensesLicenseIdGet(
        licenseId: string,
    ): CancelablePromise<string> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_licenses/standard_licenses/${licenseId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}