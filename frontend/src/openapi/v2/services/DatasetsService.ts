/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_create_dataset_from_zip_api_v2_datasets_createFromZip_post } from '../models/Body_create_dataset_from_zip_api_v2_datasets_createFromZip_post';
import type { Body_save_file_api_v2_datasets__dataset_id__files_post } from '../models/Body_save_file_api_v2_datasets__dataset_id__files_post';
import type { Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post } from '../models/Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post';
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
     * @param mine
     * @param enableAdmin
     * @param datasetId
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetsApiV2DatasetsGet(
        skip?: number,
        limit: number = 10,
        mine: boolean = false,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets`,
            query: {
                'skip': skip,
                'limit': limit,
                'mine': mine,
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static getDatasetApiV2DatasetsDatasetIdGet(
        datasetId: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}`,
            query: {
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static editDatasetApiV2DatasetsDatasetIdPut(
        datasetId: string,
        requestBody: DatasetBase,
        enableAdmin: boolean = false,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/datasets/${datasetId}`,
            query: {
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteDatasetApiV2DatasetsDatasetIdDelete(
        datasetId: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}`,
            query: {
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static patchDatasetApiV2DatasetsDatasetIdPatch(
        datasetId: string,
        requestBody: DatasetPatch,
        enableAdmin: boolean = false,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}`,
            query: {
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetFilesApiV2DatasetsDatasetIdFilesGet(
        datasetId: string,
        folderId?: string,
        skip?: number,
        limit: number = 10,
        enableAdmin: boolean = false,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/files`,
            query: {
                'folder_id': folderId,
                'skip': skip,
                'limit': limit,
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveFileApiV2DatasetsDatasetIdFilesPost(
        datasetId: string,
        formData: Body_save_file_api_v2_datasets__dataset_id__files_post,
        folderId?: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/files`,
            query: {
                'folder_id': folderId,
                'enable_admin': enableAdmin,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
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
     * @param enableAdmin
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getFreezeDatasetsApiV2DatasetsDatasetIdFreezeGet(
        datasetId: string,
        skip?: number,
        limit: number = 10,
        enableAdmin: boolean = false,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/freeze`,
            query: {
                'skip': skip,
                'limit': limit,
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Freeze Dataset
     * @param datasetId
     * @param enableAdmin
     * @returns DatasetFreezeOut Successful Response
     * @throws ApiError
     */
    public static freezeDatasetApiV2DatasetsDatasetIdFreezePost(
        datasetId: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<DatasetFreezeOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/freeze`,
            query: {
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Freeze Dataset Lastest Version Num
     * @param datasetId
     * @param enableAdmin
     * @returns number Successful Response
     * @throws ApiError
     */
    public static getFreezeDatasetLastestVersionNumApiV2DatasetsDatasetIdFreezeLatestVersionNumGet(
        datasetId: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<number> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/freeze/latest_version_num`,
            query: {
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Freeze Dataset Version
     * @param datasetId
     * @param frozenVersionNum
     * @param enableAdmin
     * @returns DatasetFreezeOut Successful Response
     * @throws ApiError
     */
    public static getFreezeDatasetVersionApiV2DatasetsDatasetIdFreezeFrozenVersionNumGet(
        datasetId: string,
        frozenVersionNum: number,
        enableAdmin: boolean = false,
    ): CancelablePromise<DatasetFreezeOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/freeze/${frozenVersionNum}`,
            query: {
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Freeze Dataset Version
     * @param datasetId
     * @param frozenVersionNum
     * @param enableAdmin
     * @returns DatasetFreezeOut Successful Response
     * @throws ApiError
     */
    public static deleteFreezeDatasetVersionApiV2DatasetsDatasetIdFreezeFrozenVersionNumDelete(
        datasetId: string,
        frozenVersionNum: number,
        enableAdmin: boolean = false,
    ): CancelablePromise<DatasetFreezeOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}/freeze/${frozenVersionNum}`,
            query: {
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersApiV2DatasetsDatasetIdFoldersGet(
        datasetId: string,
        parentFolder?: string,
        skip?: number,
        limit: number = 10,
        enableAdmin: boolean = false,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/folders`,
            query: {
                'parent_folder': parentFolder,
                'skip': skip,
                'limit': limit,
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns FolderOut Successful Response
     * @throws ApiError
     */
    public static addFolderApiV2DatasetsDatasetIdFoldersPost(
        datasetId: string,
        requestBody: FolderIn,
        enableAdmin: boolean = false,
    ): CancelablePromise<FolderOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/folders`,
            query: {
                'enable_admin': enableAdmin,
            },
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
     * @param enableAdmin
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersAndFilesApiV2DatasetsDatasetIdFoldersAndFilesGet(
        datasetId: string,
        folderId?: string,
        skip?: number,
        limit: number = 10,
        enableAdmin: boolean = false,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/folders_and_files`,
            query: {
                'folder_id': folderId,
                'skip': skip,
                'limit': limit,
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Folders All
     * @param datasetId
     * @param skip
     * @param limit
     * @param enableAdmin
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDatasetFoldersAllApiV2DatasetsDatasetIdAllFoldersGet(
        datasetId: string,
        skip?: number,
        limit: number = 10,
        enableAdmin: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/all_folders`,
            query: {
                'skip': skip,
                'limit': limit,
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFolderApiV2DatasetsDatasetIdFoldersFolderIdGet(
        datasetId: string,
        folderId: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/folders/${folderId}`,
            query: {
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Folder
     * @param datasetId
     * @param folderId
     * @param enableAdmin
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFolderApiV2DatasetsDatasetIdFoldersFolderIdDelete(
        datasetId: string,
        folderId: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}/folders/${folderId}`,
            query: {
                'enable_admin': enableAdmin,
            },
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
     * @param enableAdmin
     * @returns FolderOut Successful Response
     * @throws ApiError
     */
    public static patchFolderApiV2DatasetsDatasetIdFoldersFolderIdPatch(
        datasetId: string,
        folderId: string,
        requestBody: FolderPatch,
        enableAdmin: boolean = false,
    ): CancelablePromise<FolderOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}/folders/${folderId}`,
            query: {
                'enable_admin': enableAdmin,
            },
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
     * @param enableAdmin
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveFilesApiV2DatasetsDatasetIdFilesMultiplePost(
        datasetId: string,
        formData: Body_save_files_api_v2_datasets__dataset_id__filesMultiple_post,
        folderId?: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<Array<FileOut>> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/filesMultiple`,
            query: {
                'folder_id': folderId,
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static saveLocalFileApiV2DatasetsDatasetIdLocalFilesPost(
        datasetId: string,
        requestBody: LocalFileIn,
        folderId?: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/local_files`,
            query: {
                'folder_id': folderId,
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadDatasetApiV2DatasetsDatasetIdDownloadGet(
        datasetId: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/download`,
            query: {
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDatasetExtractApiV2DatasetsDatasetIdExtractPost(
        datasetId: string,
        extractorName: string,
        enableAdmin: boolean = false,
        requestBody?: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/extract`,
            query: {
                'extractorName': extractorName,
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadDatasetThumbnailApiV2DatasetsDatasetIdThumbnailGet(
        datasetId: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/thumbnail`,
            query: {
                'enable_admin': enableAdmin,
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
     * @param enableAdmin
     * @returns DatasetOut Successful Response
     * @throws ApiError
     */
    public static addDatasetThumbnailApiV2DatasetsDatasetIdThumbnailThumbnailIdPatch(
        datasetId: string,
        thumbnailId: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<DatasetOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}/thumbnail/${thumbnailId}`,
            query: {
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}