/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Collection } from '../models/Collection';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class CollectionsService {

    /**
     * Get Collections
     * @param skip
     * @param limit
     * @returns Collection Successful Response
     * @throws ApiError
     */
    public static getCollectionsApiV2CollectionsGet(
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<Collection>> {
        return __request({
            method: 'GET',
            path: `/api/v2/collections/`,
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
     * Save Collection
     * @param requestBody
     * @returns Collection Successful Response
     * @throws ApiError
     */
    public static saveCollectionApiV2CollectionsPost(
        requestBody: Collection,
    ): CancelablePromise<Collection> {
        return __request({
            method: 'POST',
            path: `/api/v2/collections/`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Collection
     * @param collectionId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getCollectionApiV2CollectionsCollectionIdGet(
        collectionId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/collections/${collectionId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}