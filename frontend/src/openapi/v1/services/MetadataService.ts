/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class MetadataService {

    /**
     * Delete the metadata by id.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteMetadata(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/metadata.jsonld/${id}`,
            errors: {
                400: `Invalid Metadata`,
            },
        });
    }

    /**
     * Get set of metadata fields containing filter substring for autocomplete.
     * @param filter
     * @returns any OK
     * @throws ApiError
     */
    public static getMetadata(
        filter: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/metadata/autocompletenames`,
            query: {
                'filter': filter,
            },
        });
    }

    /**
     * Get Vocabulary definitions with distinct names.
     * @returns any OK
     * @throws ApiError
     */
    public static getMetadata1(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/metadata/distinctdefinitions`,
        });
    }

    /**
     * Get Vocabulary definitions.
     * @returns any OK
     * @throws ApiError
     */
    public static getMetadata2(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/metadata/definitions`,
        });
    }

    /**
     * Get Vocabulary definitions by id.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getMetadata3(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/metadata/definitions/${id}`,
        });
    }

    /**
     * List all Standard Vocabularies
     * Retrieve all Standard Vocabulary objects.
     *
     * @returns any OK
     * @throws ApiError
     */
    public static getMetadata4(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/standardvocab`,
            errors: {
                400: `Bad request`,
                401: `Not authorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Create a new Standard Vocabulary
     * Requires that the request body contains a List[String] of terms.
     *
     * @param requestBody The list of terms to add to this vocabulary.
     * @returns any OK
     * @throws ApiError
     */
    public static postMetadata(
        requestBody: Array<string>,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/standardvocab`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Not authorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Get a specific Standard Vocabulary
     * Lookup and return an existing Standard Vocabulary using its ID.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getMetadata5(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/standardvocab/${id}`,
            errors: {
                400: `Bad request`,
                401: `Not authorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Update a Standard Vocabulary
     * Requires that the request body contains a List[String] of terms.
     *
     * @param id
     * @param requestBody The list of terms to add to this vocabulary.
     * @returns any OK
     * @throws ApiError
     */
    public static putMetadata(
        id: string,
        requestBody: Array<string>,
    ): CancelablePromise<any> {
        return __request({
            method: 'PUT',
            path: `/standardvocab/${id}`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `Bad request`,
                401: `Not authorized`,
                403: `Forbidden`,
            },
        });
    }

    /**
     * Delete a Standard Vocabulary
     * Lookup and remove a Standard Vocabulary using its ID.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteMetadata1(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/standardvocab/${id}`,
        });
    }

    /**
     * Get the terms list of a specific Standard Vocabulary
     * Lookup and return the term list of an existing Standard Vocabulary
     * using its ID.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getMetadata6(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/standardvocab/${id}/terms`,
            errors: {
                400: `Bad request`,
                401: `Not authorized`,
                403: `Forbidden`,
            },
        });
    }

}