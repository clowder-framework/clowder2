/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_get_dataset_metadata_api_v2_public_datasets__dataset_id__metadata_get } from '../models/Body_get_dataset_metadata_api_v2_public_datasets__dataset_id__metadata_get';
import type { DatasetOut } from '../models/DatasetOut';
import type { FileOut } from '../models/FileOut';
import type { FolderOut } from '../models/FolderOut';
import type { MetadataOut } from '../models/MetadataOut';
import type { Paged } from '../models/Paged';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicDatasetsService {

    /**
     * Get Datasets
     * @param skip
     * @param limit
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetsApiV2PublicDatasetsGet(
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_datasets`,
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
            path: `/api/v2/public_datasets/${datasetId}`,
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
            path: `/api/v2/public_datasets/${datasetId}/files`,
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
            path: `/api/v2/public_datasets/${datasetId}/folders`,
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

    /**
     * Get Dataset Folders And Files
     * @param datasetId
     * @param folderId
     * @param skip
     * @param limit
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersAndFilesApiV2PublicDatasetsDatasetIdFoldersAndFilesGet(
        datasetId: string,
        folderId?: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_datasets/${datasetId}/folders_and_files`,
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
     * Get Dataset Metadata
     * @param datasetId
     * @param formData
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static getDatasetMetadataApiV2PublicDatasetsDatasetIdMetadataGet(
        datasetId: string,
        formData?: Body_get_dataset_metadata_api_v2_public_datasets__dataset_id__metadata_get,
    ): CancelablePromise<Array<MetadataOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_datasets/${datasetId}/metadata`,
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download Dataset
     * @param datasetId
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static downloadDatasetApiV2PublicDatasetsDatasetIdDownloadGet(
        datasetId: string,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_datasets/${datasetId}/download`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Freeze Datasets
     * @param datasetId
     * @param skip
     * @param limit
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getFreezeDatasetsApiV2PublicDatasetsDatasetIdFreezeGet(
        datasetId: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_datasets/${datasetId}/freeze`,
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