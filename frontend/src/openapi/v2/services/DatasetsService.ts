/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_create_dataset_from_zip_api_v2_datasets_createFromZip_post } from '../models/Body_create_dataset_from_zip_api_v2_datasets_createFromZip_post';
import type { Body_save_file_api_v2_datasets__dataset_id__files_post } from '../models/Body_save_file_api_v2_datasets__dataset_id__files_post';
import type { Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post } from '../models/Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post';
import type { DatasetBase } from '../models/DatasetBase';
import type { DatasetIn } from '../models/DatasetIn';
import type { DatasetOut } from '../models/DatasetOut';
import type { DatasetPatch } from '../models/DatasetPatch';
import type { FileOut } from '../models/FileOut';
import type { FolderIn } from '../models/FolderIn';
import type { FolderOut } from '../models/FolderOut';
import type { LocalFileIn } from '../models/LocalFileIn';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class DatasetsService {

    /**
     * Get Datasets
     * @param adminMode
     * @param skip
     * @param limit
     * @param mine
     * @param datasetId
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static getDatasetsApiV2DatasetsGet(
        adminMode: boolean = false,
        skip?: number,
        limit: number = 10,
        mine: boolean = false,
        datasetId?: string,
    ): CancelablePromise<Array<DatasetOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets`,
            query: {
                'admin_mode': adminMode,
                'skip': skip,
                'limit': limit,
                'mine': mine,
                'dataset_id': datasetId,
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
     * @param adminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static getDatasetApiV2DatasetsDatasetIdGet(
        datasetId: string,
        adminMode: boolean = false,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}`,
            query: {
                'admin_mode': adminMode,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Edit Dataset
     * @param datasetId
     * @param requestBody
     * @param adminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static editDatasetApiV2DatasetsDatasetIdPut(
        datasetId: string,
        requestBody: DatasetBase,
        adminMode: boolean = false,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/datasets/${datasetId}`,
            query: {
                'admin_mode': adminMode,
            },
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
     * @param adminMode
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteDatasetApiV2DatasetsDatasetIdDelete(
        datasetId: string,
        adminMode: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}`,
            query: {
                'admin_mode': adminMode,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Patch Dataset
     * @param datasetId
     * @param requestBody
     * @param adminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static patchDatasetApiV2DatasetsDatasetIdPatch(
        datasetId: string,
        requestBody: DatasetPatch,
        adminMode: boolean = false,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}`,
            query: {
                'admin_mode': adminMode,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Files
     * @param datasetId
     * @param adminMode
     * @param folderId
     * @param skip
     * @param limit
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static getDatasetFilesApiV2DatasetsDatasetIdFilesGet(
        datasetId: string,
        adminMode: boolean = false,
        folderId?: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<FileOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/files`,
            query: {
                'admin_mode': adminMode,
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
     * Save File
     * @param datasetId
     * @param formData
     * @param folderId
     * @param adminMode
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveFileApiV2DatasetsDatasetIdFilesPost(
        datasetId: string,
        formData: Body_save_file_api_v2_datasets__dataset_id__files_post,
        folderId?: string,
        adminMode: boolean = false,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/files`,
            query: {
                'folder_id': folderId,
                'admin_mode': adminMode,
            },
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
     * @param adminMode
     * @param parentFolder
     * @param skip
     * @param limit
     * @returns FolderOut Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersApiV2DatasetsDatasetIdFoldersGet(
        datasetId: string,
        adminMode: boolean = false,
        parentFolder?: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<FolderOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/folders`,
            query: {
                'admin_mode': adminMode,
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
     * Add Folder
     * @param datasetId
     * @param requestBody
     * @param adminMode
     * @returns FolderOut Successful Response
     * @throws ApiError
     */
    public static addFolderApiV2DatasetsDatasetIdFoldersPost(
        datasetId: string,
        requestBody: FolderIn,
        adminMode: boolean = false,
    ): CancelablePromise<FolderOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/folders`,
            query: {
                'admin_mode': adminMode,
            },
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
     * @param adminMode
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFolderApiV2DatasetsDatasetIdFoldersFolderIdDelete(
        datasetId: string,
        folderId: string,
        adminMode: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}/folders/${folderId}`,
            query: {
                'admin_mode': adminMode,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save Files
     * @param datasetId
     * @param formData
     * @param adminMode
     * @param folderId
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveFilesApiV2DatasetsDatasetIdFilesMultiplePost(
        datasetId: string,
        formData: Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post,
        adminMode: boolean = false,
        folderId?: string,
    ): CancelablePromise<Array<FileOut>> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/filesMultiple`,
            query: {
                'admin_mode': adminMode,
                'folder_id': folderId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save Local File
     * @param datasetId
     * @param requestBody
     * @param folderId
     * @param adminMode
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveLocalFileApiV2DatasetsDatasetIdLocalFilesPost(
        datasetId: string,
        requestBody: LocalFileIn,
        folderId?: string,
        adminMode: boolean = false,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/local_files`,
            query: {
                'folder_id': folderId,
                'admin_mode': adminMode,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Create Dataset From Zip
     * @param formData
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static createDatasetFromZipApiV2DatasetsCreateFromZipPost(
        formData: Body_create_dataset_from_zip_api_v2_datasets_createFromZip_post,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/createFromZip`,
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download Dataset
     * @param datasetId
     * @param adminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static downloadDatasetApiV2DatasetsDatasetIdDownloadGet(
        datasetId: string,
        adminMode: boolean = false,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/download`,
            query: {
                'admin_mode': adminMode,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Extract
     * @param datasetId
     * @param extractorName
     * @param adminMode
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDatasetExtractApiV2DatasetsDatasetIdExtractPost(
        datasetId: string,
        extractorName: string,
        adminMode: boolean = false,
        requestBody?: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/extract`,
            query: {
                'extractorName': extractorName,
                'admin_mode': adminMode,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download Dataset Thumbnail
     * @param datasetId
     * @param adminMode
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadDatasetThumbnailApiV2DatasetsDatasetIdThumbnailGet(
        datasetId: string,
        adminMode: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/thumbnail`,
            query: {
                'admin_mode': adminMode,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Dataset Thumbnail
     * @param datasetId
     * @param thumbnailId
     * @param adminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static addDatasetThumbnailApiV2DatasetsDatasetIdThumbnailThumbnailIdPatch(
        datasetId: string,
        thumbnailId: string,
        adminMode: boolean = false,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}/thumbnail/${thumbnailId}`,
            query: {
                'admin_mode': adminMode,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}