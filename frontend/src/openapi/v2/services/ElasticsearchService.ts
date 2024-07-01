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
     * @param enableAdmin
     * @param datasetId
     * @returns string Successful Response
     * @throws ApiError
     */
    public static searchApiV2ElasticsearchSearchPut(
        indexName: string,
        query: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<string> {
        return __request({
            method: 'PUT',
            path: `/api/v2/elasticsearch/search`,
            query: {
                'index_name': indexName,
                'query': query,
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Msearch
     * @param enableAdmin
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static msearchApiV2ElasticsearchAllMsearchPost(
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/elasticsearch/all/_msearch`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}