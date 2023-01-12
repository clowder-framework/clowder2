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
     * @returns string Successful Response
     * @throws ApiError
     */
    public static searchApiV2ElasticsearchSearchPut(
        indexName: string,
        query: string,
    ): CancelablePromise<string> {
        return __request({
            method: 'PUT',
            path: `/api/v2/elasticsearch/search`,
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
     * Search File
     * @returns any Successful Response
     * @throws ApiError
     */
    public static searchFileApiV2ElasticsearchFileMsearchPost(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/elasticsearch/file/_msearch`,
        });
    }

    /**
     * Search Dataset
     * @returns any Successful Response
     * @throws ApiError
     */
    public static searchDatasetApiV2ElasticsearchDatasetMsearchPost(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/elasticsearch/dataset/_msearch`,
        });
    }

    /**
     * Search Metadata
     * @returns any Successful Response
     * @throws ApiError
     */
    public static searchMetadataApiV2ElasticsearchMetadataMsearchPost(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/elasticsearch/metadata/_msearch`,
        });
    }

    /**
     * Search File Dataset And Metadata
     * @returns any Successful Response
     * @throws ApiError
     */
    public static searchFileDatasetAndMetadataApiV2ElasticsearchFileDatasetMetadataMsearchPost(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/elasticsearch/file,dataset,metadata/_msearch`,
        });
    }

}