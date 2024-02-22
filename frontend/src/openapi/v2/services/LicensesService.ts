/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LicenseBase } from '../models/LicenseBase';
import type { LicenseIn } from '../models/LicenseIn';
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
     * @param datasetId
     * @returns LicenseOut Successful Response
     * @throws ApiError
     */
    public static getLicenseApiV2LicensesDatasetIdGet(
        datasetId: string,
    ): CancelablePromise<LicenseOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/licenses/${datasetId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Edit License
     * @param licenseId
     * @param requestBody
     * @param datasetId
     * @returns LicenseOut Successful Response
     * @throws ApiError
     */
    public static editLicenseApiV2LicensesLicenseIdPut(
        licenseId: string,
        requestBody: LicenseBase,
        datasetId?: string,
    ): CancelablePromise<LicenseOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/licenses/${licenseId}`,
            query: {
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
     * @param datasetId
     * @returns LicenseOut Successful Response
     * @throws ApiError
     */
    public static deleteLicenseApiV2LicensesLicenseIdDelete(
        licenseId: string,
        datasetId?: string,
    ): CancelablePromise<LicenseOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/licenses/${licenseId}`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}