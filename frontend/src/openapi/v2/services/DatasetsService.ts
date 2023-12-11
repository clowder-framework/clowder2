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
     * @param skip
     * @param limit
     * @param mine
     * @param datasetId
     * @param xAdminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static getDatasetsApiV2DatasetsGet(
        skip?: number,
        limit: number = 10,
        mine: boolean = false,
        datasetId?: string,
        xAdminMode?: string,
    ): CancelablePromise<Array<DatasetOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
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
     * @param xAdminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static getDatasetApiV2DatasetsDatasetIdGet(
        datasetId: string,
        xAdminMode?: string,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}`,
            headers: {
                'x_admin_mode': xAdminMode,
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
     * @param xAdminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static editDatasetApiV2DatasetsDatasetIdPut(
        datasetId: string,
        requestBody: DatasetBase,
        xAdminMode?: string,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/datasets/${datasetId}`,
            headers: {
                'x_admin_mode': xAdminMode,
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
     * @param xAdminMode
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteDatasetApiV2DatasetsDatasetIdDelete(
        datasetId: string,
        xAdminMode?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}`,
            headers: {
                'x_admin_mode': xAdminMode,
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
     * @param xAdminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static patchDatasetApiV2DatasetsDatasetIdPatch(
        datasetId: string,
        requestBody: DatasetPatch,
        xAdminMode?: string,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}`,
            headers: {
                'x_admin_mode': xAdminMode,
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
     * @param folderId
     * @param skip
     * @param limit
     * @param xAdminMode
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static getDatasetFilesApiV2DatasetsDatasetIdFilesGet(
        datasetId: string,
        folderId?: string,
        skip?: number,
        limit: number = 10,
        xAdminMode?: string,
    ): CancelablePromise<Array<FileOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/files`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
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
     * Save File
     * @param datasetId
     * @param formData
     * @param folderId
     * @param xAdminMode
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveFileApiV2DatasetsDatasetIdFilesPost(
        datasetId: string,
        formData: Body_save_file_api_v2_datasets__dataset_id__files_post,
        folderId?: string,
        xAdminMode?: string,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/files`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
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
     * Get Dataset Folders
     * @param datasetId
     * @param parentFolder
     * @param skip
     * @param limit
     * @param xAdminMode
     * @returns FolderOut Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersApiV2DatasetsDatasetIdFoldersGet(
        datasetId: string,
        parentFolder?: string,
        skip?: number,
        limit: number = 10,
        xAdminMode?: string,
    ): CancelablePromise<Array<FolderOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/folders`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
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
     * Add Folder
     * @param datasetId
     * @param requestBody
     * @param xAdminMode
     * @returns FolderOut Successful Response
     * @throws ApiError
     */
    public static addFolderApiV2DatasetsDatasetIdFoldersPost(
        datasetId: string,
        requestBody: FolderIn,
        xAdminMode?: string,
    ): CancelablePromise<FolderOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/folders`,
            headers: {
                'x_admin_mode': xAdminMode,
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
     * @param xAdminMode
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFolderApiV2DatasetsDatasetIdFoldersFolderIdDelete(
        datasetId: string,
        folderId: string,
        xAdminMode?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}/folders/${folderId}`,
            headers: {
                'x_admin_mode': xAdminMode,
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
     * @param folderId
     * @param xAdminMode
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveFilesApiV2DatasetsDatasetIdFilesMultiplePost(
        datasetId: string,
        formData: Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post,
        folderId?: string,
        xAdminMode?: string,
    ): CancelablePromise<Array<FileOut>> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/filesMultiple`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
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
     * @param xAdminMode
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveLocalFileApiV2DatasetsDatasetIdLocalFilesPost(
        datasetId: string,
        requestBody: LocalFileIn,
        folderId?: string,
        xAdminMode?: string,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/local_files`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
                'folder_id': folderId,
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
     * @param xAdminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static downloadDatasetApiV2DatasetsDatasetIdDownloadGet(
        datasetId: string,
        xAdminMode?: string,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/download`,
            headers: {
                'x_admin_mode': xAdminMode,
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
     * @param xAdminMode
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDatasetExtractApiV2DatasetsDatasetIdExtractPost(
        datasetId: string,
        extractorName: string,
        xAdminMode?: string,
        requestBody?: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/extract`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
                'extractorName': extractorName,
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
     * @param xAdminMode
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadDatasetThumbnailApiV2DatasetsDatasetIdThumbnailGet(
        datasetId: string,
        xAdminMode?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/thumbnail`,
            headers: {
                'x_admin_mode': xAdminMode,
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
     * @param xAdminMode
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static addDatasetThumbnailApiV2DatasetsDatasetIdThumbnailThumbnailIdPatch(
        datasetId: string,
        thumbnailId: string,
        xAdminMode?: string,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}/thumbnail/${thumbnailId}`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}