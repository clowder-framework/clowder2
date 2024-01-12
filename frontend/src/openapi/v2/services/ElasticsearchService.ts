/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ElasticsearchService {

    /**
     * Search
     * @param indexName
     * @param query
     * @param datasetId
     * @returns string Successful Response
     * @throws ApiError
     */
    public static searchApiV2ElasticsearchSearchPut(
        indexName: string,
        query: string,
        datasetId?: string,
    ): CancelablePromise<string> {
        return __request({
            method: 'PUT',
            path: `/api/v2/elasticsearch/search`,
            query: {
                'index_name': indexName,
                'query': query,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Msearch
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static msearchApiV2ElasticsearchAllMsearchPost(
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/elasticsearch/all/_msearch`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}