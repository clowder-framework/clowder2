/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_create_dataset_from_zip_api_v2_datasets_createFromZip_post } from '../models/Body_create_dataset_from_zip_api_v2_datasets_createFromZip_post';
import type { Body_save_file_api_v2_datasets__dataset_id__files_post } from '../models/Body_save_file_api_v2_datasets__dataset_id__files_post';
import type { Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post } from '../models/Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post';
import type { CombinedDataset } from '../models/CombinedDataset';
import type { DatasetBase } from '../models/DatasetBase';
import type { DatasetFreezeOut } from '../models/DatasetFreezeOut';
import type { DatasetIn } from '../models/DatasetIn';
import type { DatasetOut } from '../models/DatasetOut';
import type { DatasetPatch } from '../models/DatasetPatch';
import type { FileOut } from '../models/FileOut';
import type { FolderIn } from '../models/FolderIn';
import type { FolderOut } from '../models/FolderOut';
import type { FolderPatch } from '../models/FolderPatch';
import type { LocalFileIn } from '../models/LocalFileIn';
import type { Paged } from '../models/Paged';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class DatasetsService {

    /**
     * Get Datasets
     * @param skip
     * @param limit
     * @param frozenOnly
     * @param mine
     * @param datasetId
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetsApiV2DatasetsGet(
        skip?: number,
        limit: number = 10,
        frozenOnly: boolean = false,
        mine: boolean = false,
        datasetId?: string,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets`,
            query: {
                'skip': skip,
                'limit': limit,
                'frozen_only': frozenOnly,
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
     * @param licenseId
     * @param requestBody
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static saveDatasetApiV2DatasetsPost(
        licenseId: string,
        requestBody: DatasetIn,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets`,
            query: {
                'license_id': licenseId,
            },
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
     * @returns CombinedDataset Successful Response
     * @throws ApiError
     */
    public static getDatasetApiV2DatasetsDatasetIdGet(
        datasetId: string,
    ): CancelablePromise<CombinedDataset> {
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
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static editDatasetApiV2DatasetsDatasetIdPut(
        datasetId: string,
        requestBody: DatasetBase,
    ): CancelablePromise<DatasetOut> {
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
     * Patch Dataset
     * @param datasetId
     * @param requestBody
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static patchDatasetApiV2DatasetsDatasetIdPatch(
        datasetId: string,
        requestBody: DatasetPatch,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}`,
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
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetFilesApiV2DatasetsDatasetIdFilesGet(
        datasetId: string,
        folderId?: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/files`,
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
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveFileApiV2DatasetsDatasetIdFilesPost(
        datasetId: string,
        formData: Body_save_file_api_v2_datasets__dataset_id__files_post,
        folderId?: string,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/files`,
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
     * Draft Freeze Dataset
     * @param datasetId
     * @returns DatasetFreezeOut Successful Response
     * @throws ApiError
     */
    public static draftFreezeDatasetApiV2DatasetsDatasetIdFreezeDraftPost(
        datasetId: string,
    ): CancelablePromise<DatasetFreezeOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/freeze_draft`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Freeze Dataset
     * @param datasetId
     * @returns DatasetFreezeOut Successful Response
     * @throws ApiError
     */
    public static freezeDatasetApiV2DatasetsDatasetIdFreezePost(
        datasetId: string,
    ): CancelablePromise<DatasetFreezeOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/freeze`,
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
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersApiV2DatasetsDatasetIdFoldersGet(
        datasetId: string,
        parentFolder?: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/folders`,
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
     * Get Dataset Folders And Files
     * @param datasetId
     * @param folderId
     * @param skip
     * @param limit
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersAndFilesApiV2DatasetsDatasetIdFoldersAndFilesGet(
        datasetId: string,
        folderId?: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/folders_and_files`,
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
     * Get Folder
     * @param datasetId
     * @param folderId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFolderApiV2DatasetsDatasetIdFoldersFolderIdGet(
        datasetId: string,
        folderId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/folders/${folderId}`,
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
    public static deleteFolderApiV2DatasetsDatasetIdFoldersFolderIdDelete(
        datasetId: string,
        folderId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}/folders/${folderId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Patch Folder
     * @param datasetId
     * @param folderId
     * @param requestBody
     * @returns FolderOut Successful Response
     * @throws ApiError
     */
    public static patchFolderApiV2DatasetsDatasetIdFoldersFolderIdPatch(
        datasetId: string,
        folderId: string,
        requestBody: FolderPatch,
    ): CancelablePromise<FolderOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}/folders/${folderId}`,
            body: requestBody,
            mediaType: 'application/json',
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
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveFilesApiV2DatasetsDatasetIdFilesMultiplePost(
        datasetId: string,
        formData: Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post,
        folderId?: string,
    ): CancelablePromise<Array<FileOut>> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/filesMultiple`,
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
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveLocalFileApiV2DatasetsDatasetIdLocalFilesPost(
        datasetId: string,
        requestBody: LocalFileIn,
        folderId?: string,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/local_files`,
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
     * @returns CombinedDataset Successful Response
     * @throws ApiError
     */
    public static downloadDatasetApiV2DatasetsDatasetIdDownloadGet(
        datasetId: string,
    ): CancelablePromise<CombinedDataset> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/download`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Extract
     * @param datasetId
     * @param extractorName
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDatasetExtractApiV2DatasetsDatasetIdExtractPost(
        datasetId: string,
        extractorName: string,
        requestBody?: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/extract`,
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadDatasetThumbnailApiV2DatasetsDatasetIdThumbnailGet(
        datasetId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/thumbnail`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Dataset Thumbnail
     * @param datasetId
     * @param thumbnailId
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static addDatasetThumbnailApiV2DatasetsDatasetIdThumbnailThumbnailIdPatch(
        datasetId: string,
        thumbnailId: string,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}/thumbnail/${thumbnailId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}