/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LicenseBase } from '../models/LicenseBase';
import type { LicenseIn } from '../models/LicenseIn';
import type { LicenseOption } from '../models/LicenseOption';
import type { LicenseOut } from '../models/LicenseOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class LicensesService {

    /**
     * Save License
     * @param requestBody
     * @returns LicenseOut Successful Response
     * @throws ApiError
     */
    public static saveLicenseApiV2LicensesPost(
        requestBody: LicenseIn,
    ): CancelablePromise<LicenseOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/licenses`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get License
     * @param licenseId
     * @returns LicenseOut Successful Response
     * @throws ApiError
     */
    public static getLicenseApiV2LicensesLicenseIdGet(
        licenseId: string,
    ): CancelablePromise<LicenseOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/licenses/${licenseId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Edit License
     * @param licenseId
     * @param requestBody
     * @param enableAdmin
     * @param datasetId
     * @returns LicenseOut Successful Response
     * @throws ApiError
     */
    public static editLicenseApiV2LicensesLicenseIdPut(
        licenseId: string,
        requestBody: LicenseBase,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<LicenseOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/licenses/${licenseId}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete License
     * @param licenseId
     * @param enableAdmin
     * @param datasetId
     * @returns LicenseOut Successful Response
     * @throws ApiError
     */
    public static deleteLicenseApiV2LicensesLicenseIdDelete(
        licenseId: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<LicenseOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/licenses/${licenseId}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
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
    public static getStandardLicensesApiV2LicensesStandardLicensesAllGet(): CancelablePromise<Array<LicenseOption>> {
        return __request({
            method: 'GET',
            path: `/api/v2/licenses/standard_licenses/all`,
        });
    }

    /**
     * Get Standard License Url
     * @param licenseId
     * @returns string Successful Response
     * @throws ApiError
     */
    public static getStandardLicenseUrlApiV2LicensesStandardLicensesLicenseIdGet(
        licenseId: string,
    ): CancelablePromise<string> {
        return __request({
            method: 'GET',
            path: `/api/v2/licenses/standard_licenses/${licenseId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}