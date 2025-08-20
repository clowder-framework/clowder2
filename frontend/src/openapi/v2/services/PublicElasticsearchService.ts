/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicElasticsearchService {

    /**
     * Search
     * @param indexName
     * @param query
     * @returns string Successful Response
     * @throws ApiError
     */
    public static searchApiV2PublicElasticsearchSearchPut(
        indexName: string,
        query: string,
    ): CancelablePromise<string> {
        return __request({
            method: 'PUT',
            path: `/api/v2/public_elasticsearch/search`,
            query: {
                'index_name': indexName,
                'query': query,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Msearch
     * @returns any Successful Response
     * @throws ApiError
     */
    public static msearchApiV2PublicElasticsearchAllMsearchPost(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/public_elasticsearch/all/_msearch`,
        });
    }

}