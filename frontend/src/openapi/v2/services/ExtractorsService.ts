/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExtractorBase } from '../models/ExtractorBase';
import type { ExtractorIn } from '../models/ExtractorIn';
import type { ExtractorOut } from '../models/ExtractorOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ExtractorsService {

    /**
     * Get Extractors
     * @param skip
     * @param limit
     * @returns ExtractorOut Successful Response
     * @throws ApiError
     */
    public static getExtractorsApiV2ExtractorsGet(
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<ExtractorOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/extractors`,
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save Extractor
     * @param requestBody
     * @returns ExtractorOut Successful Response
     * @throws ApiError
     */
    public static saveExtractorApiV2ExtractorsPost(
        requestBody: ExtractorIn,
    ): CancelablePromise<ExtractorOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/extractors`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Extractor
     * @param extractorId
     * @returns ExtractorOut Successful Response
     * @throws ApiError
     */
    public static getExtractorApiV2ExtractorsExtractorIdGet(
        extractorId: string,
    ): CancelablePromise<ExtractorOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/extractors/${extractorId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Edit Extractor
     * @param extractorId
     * @param requestBody
     * @returns ExtractorOut Successful Response
     * @throws ApiError
     */
    public static editExtractorApiV2ExtractorsExtractorIdPut(
        extractorId: string,
        requestBody: ExtractorBase,
    ): CancelablePromise<ExtractorOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/extractors/${extractorId}`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Extractor
     * @param extractorId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteExtractorApiV2ExtractorsExtractorIdDelete(
        extractorId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/extractors/${extractorId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}