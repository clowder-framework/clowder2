/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_update_file_api_v2_files__file_id__put } from '../models/Body_update_file_api_v2_files__file_id__put';
import type { FileOut } from '../models/FileOut';
import type { FileVersion } from '../models/FileVersion';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class FilesService {

    /**
     * Download File
     * @param fileId
     * @param version
     * @param increment
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFileApiV2FilesFileIdGet(
        fileId: string,
        version?: number,
        increment: boolean = true,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}`,
            query: {
                'version': version,
                'increment': increment,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update File
     * @param fileId
     * @param formData
     * @param datasetId
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static updateFileApiV2FilesFileIdPut(
        fileId: string,
        formData: Body_update_file_api_v2_files__file_id__put,
        datasetId?: string,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/files/${fileId}`,
            query: {
                'dataset_id': datasetId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete File
     * @param fileId
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFileApiV2FilesFileIdDelete(
        fileId: string,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/files/${fileId}`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download File Url
     * @param fileId
     * @param version
     * @param expiresInSeconds
     * @param increment
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFileUrlApiV2FilesFileIdUrlGet(
        fileId: string,
        version?: number,
        expiresInSeconds: number = 3600,
        increment: boolean = true,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}/url/`,
            query: {
                'version': version,
                'expires_in_seconds': expiresInSeconds,
                'increment': increment,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get File Summary
     * @param fileId
     * @param datasetId
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static getFileSummaryApiV2FilesFileIdSummaryGet(
        fileId: string,
        datasetId?: string,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}/summary`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get File Version Details
     * @param fileId
     * @param versionNum
     * @param datasetId
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static getFileVersionDetailsApiV2FilesFileIdVersionDetailsGet(
        fileId: string,
        versionNum?: number,
        datasetId?: string,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}/version_details`,
            query: {
                'version_num': versionNum,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get File Versions
     * @param fileId
     * @param skip
     * @param limit
     * @param datasetId
     * @returns FileVersion Successful Response
     * @throws ApiError
     */
    public static getFileVersionsApiV2FilesFileIdVersionsGet(
        fileId: string,
        skip?: number,
        limit: number = 20,
        datasetId?: string,
    ): CancelablePromise<Array<FileVersion>> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}/versions`,
            query: {
                'skip': skip,
                'limit': limit,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Post File Extract
     * @param fileId
     * @param extractorName
     * @param datasetId
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static postFileExtractApiV2FilesFileIdExtractPost(
        fileId: string,
        extractorName: string,
        datasetId?: string,
        requestBody?: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/files/${fileId}/extract`,
            query: {
                'extractorName': extractorName,
                'dataset_id': datasetId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Resubmit File Extractions
     * This route will check metadata. We get the extractors run from metadata from extractors.
     * Then they are resubmitted. At present parameters are not stored. This will change once Jobs are
     * implemented.
     *
     * Arguments:
     * file_id: Id of file
     * credentials: credentials of logged in user
     * rabbitmq_client: Rabbitmq Client
     * @param fileId
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resubmitFileExtractionsApiV2FilesFileIdResubmitExtractPost(
        fileId: string,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/files/${fileId}/resubmit_extract`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download File Thumbnail
     * @param fileId
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFileThumbnailApiV2FilesFileIdThumbnailGet(
        fileId: string,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}/thumbnail`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add File Thumbnail
     * @param fileId
     * @param thumbnailId
     * @param datasetId
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static addFileThumbnailApiV2FilesFileIdThumbnailThumbnailIdPatch(
        fileId: string,
        thumbnailId: string,
        datasetId?: string,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/files/${fileId}/thumbnail/${thumbnailId}`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}