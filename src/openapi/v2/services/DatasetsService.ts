/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_save_file_api_v2_datasets__dataset_id__files_post } from '../models/Body_save_file_api_v2_datasets__dataset_id__files_post';
import type { ClowderFile } from '../models/ClowderFile';
import type { Dataset } from '../models/Dataset';
import type { FolderIn } from '../models/FolderIn';
import type { FolderOut } from '../models/FolderOut';
import type { DatasetBase } from '../models/DatasetBase';
import type { DatasetIn } from '../models/DatasetIn';
import type { DatasetOut } from '../models/DatasetOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class DatasetsService {

    /**
     * Get Datasets
     * @param skip
     * @param limit
     * @param mine
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static getDatasetsApiV2DatasetsGet(
        skip?: number,
        limit: number = 2,
        mine?: any,
    ): CancelablePromise<Array<DatasetOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets`,
            query: {
                'skip': skip,
                'limit': limit,
                'mine': mine,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save Dataset
     * @param requestBody
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static saveDatasetApiV2DatasetsPost(
        requestBody: DatasetIn,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets`,
            body: requestBody,
            mediaType: 'application/json',
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
    public static getDatasetApiV2DatasetsDatasetIdGet(
        datasetId: string,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Edit Dataset
     * @param datasetId
     * @param requestBody
     * @returns DatasetBase Successful Response
     * @throws ApiError
     */
    public static editDatasetApiV2DatasetsDatasetIdPut(
        datasetId: string,
        requestBody: DatasetBase,
    ): CancelablePromise<DatasetBase> {
        return __request({
            method: 'PUT',
            path: `/api/v2/datasets/${datasetId}`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Dataset
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteDatasetApiV2DatasetsDatasetIdDelete(
        datasetId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Files
     * @param datasetId
     * @param folderId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDatasetFilesApiV2DatasetsDatasetIdFilesGet(
        datasetId: string,
        folderId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/files`,
            query: {
                'folder_id': folderId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save File
     * @param datasetId
     * @param formData
     * @returns ClowderFile Successful Response
     * @throws ApiError
     */
    public static saveFileApiV2DatasetsDatasetIdFilesPost(
        datasetId: string,
        formData: Body_save_file_api_v2_datasets__dataset_id__files_post,
    ): CancelablePromise<ClowderFile> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/files`,
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Folders
     * @param datasetId
     * @param parentFolder
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersApiV2DatasetsDatasetIdFoldersGet(
        datasetId: string,
        parentFolder?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/folders`,
            query: {
                'parent_folder': parentFolder,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Folder
     * @param datasetId
     * @param requestBody
     * @returns FolderOut Successful Response
     * @throws ApiError
     */
    public static addFolderApiV2DatasetsDatasetIdFoldersPost(
        datasetId: string,
        requestBody: FolderIn,
    ): CancelablePromise<FolderOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/folders`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Folder
     * @param datasetId
     * @param folderId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFolderApiV2DatasetsDatasetIdFolderFolderIdDelete(
        datasetId: string,
        folderId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}/folder/${folderId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
