/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { MetadataDefinitionOut } from '../models/MetadataDefinitionOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicMetadataService {

    /**
     * Get Metadata Definition List
     * @param name
     * @param skip
     * @param limit
     * @returns MetadataDefinitionOut Successful Response
     * @throws ApiError
     */
    public static getMetadataDefinitionListApiV2PublicMetadataDefinitionGet(
        name?: string,
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<MetadataDefinitionOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_metadata/definition`,
            query: {
                'name': name,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Metadata Definition
     * @param metadataDefinitionId
     * @returns MetadataDefinitionOut Successful Response
     * @throws ApiError
     */
    public static getMetadataDefinitionApiV2PublicMetadataDefinitionMetadataDefinitionIdGet(
        metadataDefinitionId: string,
    ): CancelablePromise<MetadataDefinitionOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_metadata/definition/${metadataDefinitionId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Search Metadata Definition
     * Search all metadata definition in the db based on text.
     *
     * Arguments:
     * text -- any text matching name or description
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * @param searchTerm
     * @param skip
     * @param limit
     * @returns MetadataDefinitionOut Successful Response
     * @throws ApiError
     */
    public static searchMetadataDefinitionApiV2PublicMetadataDefinitionSearchSearchTermGet(
        searchTerm: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<MetadataDefinitionOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_metadata/definition/search/${searchTerm}`,
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}