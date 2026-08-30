/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { ExtractorsLabel } from '../models/ExtractorsLabel';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ExtractorsService {

    /**
     * Lists information about all known extractors
     * Extractions for Files.
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractors(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractors`,
        });
    }

    /**
     * Register information about an extractor
     * Register information about an extractor.
     * Used when an extractor starts up.
     *
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postExtractors(
        requestBody: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/extractors`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Lists information about a specific extractor
     * Extractions for Files.
     * @param name
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractors1(
        name: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractors/${name}`,
            errors: {
                404: `Not found`,
            },
        });
    }

    /**
     * Create a new extractor label in the database
     * @param requestBody
     * @returns ExtractorsLabel OK
     * @throws ApiError
     */
    public static postExtractors1(
        requestBody?: ExtractorsLabel,
    ): CancelablePromise<ExtractorsLabel> {
        return __request({
            method: 'POST',
            path: `/extractors/labels`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Updates an extractor label in the database
     * @param id
     * @param requestBody
     * @returns ExtractorsLabel OK
     * @throws ApiError
     */
    public static putExtractors(
        id: string,
        requestBody?: ExtractorsLabel,
    ): CancelablePromise<ExtractorsLabel> {
        return __request({
            method: 'PUT',
            path: `/extractors/labels/${id}`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Deletes an extractor label from the database
     * @param id
     * @returns ExtractorsLabel OK
     * @throws ApiError
     */
    public static deleteExtractors(
        id: string,
    ): CancelablePromise<ExtractorsLabel> {
        return __request({
            method: 'DELETE',
            path: `/extractors/labels/${id}`,
        });
    }

}