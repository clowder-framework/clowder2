/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { DatasetOut } from '../models/DatasetOut';
import type { FileOut } from '../models/FileOut';
import type { FolderOut } from '../models/FolderOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicDatasetsService {

    /**
     * Get Datasets
     * @param skip
     * @param limit
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static getDatasetsApiV2PublicDatasetsGet(
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<DatasetOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public/datasets`,
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
     * Get Dataset
     * @param datasetId
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static getDatasetApiV2PublicDatasetsDatasetIdGet(
        datasetId: string,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/public/datasets/${datasetId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Files
     * @param datasetId
     * @param folderId
     * @param skip
     * @param limit
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static getDatasetFilesApiV2PublicDatasetsDatasetIdFilesGet(
        datasetId: string,
        folderId?: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<FileOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public/datasets/${datasetId}/files`,
            query: {
                'folder_id': folderId,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Folders
     * @param datasetId
     * @param parentFolder
     * @param skip
     * @param limit
     * @returns FolderOut Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersApiV2PublicDatasetsDatasetIdFoldersGet(
        datasetId: string,
        parentFolder?: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<FolderOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public/datasets/${datasetId}/folders`,
            query: {
                'parent_folder': parentFolder,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}