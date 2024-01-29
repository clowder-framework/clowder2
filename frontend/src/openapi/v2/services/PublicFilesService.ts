/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_get_file_metadata_api_v2_public_files__file_id__metadata_get } from '../models/Body_get_file_metadata_api_v2_public_files__file_id__metadata_get';
import type { FileOut } from '../models/FileOut';
import type { FileVersion } from '../models/FileVersion';
import type { MetadataOut } from '../models/MetadataOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicFilesService {

    /**
     * Get File Summary
     * @param fileId
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static getFileSummaryApiV2PublicFilesFileIdSummaryGet(
        fileId: string,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_files/${fileId}/summary`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get File Version Details
     * @param fileId
     * @param versionNum
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static getFileVersionDetailsApiV2PublicFilesFileIdVersionDetailsGet(
        fileId: string,
        versionNum?: number,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_files/${fileId}/version_details`,
            query: {
                'version_num': versionNum,
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
     * @returns FileVersion Successful Response
     * @throws ApiError
     */
    public static getFileVersionsApiV2PublicFilesFileIdVersionsGet(
        fileId: string,
        skip?: number,
        limit: number = 20,
    ): CancelablePromise<Array<FileVersion>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_files/${fileId}/versions`,
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
     * Download File
     * @param fileId
     * @param version
     * @param increment
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFileApiV2PublicFilesFileIdGet(
        fileId: string,
        version?: number,
        increment: boolean = true,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_files/${fileId}`,
            query: {
                'version': version,
                'increment': increment,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download File Thumbnail
     * @param fileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFileThumbnailApiV2PublicFilesFileIdThumbnailGet(
        fileId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_files/${fileId}/thumbnail`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get File Metadata
     * Get file metadata.
     * @param fileId
     * @param version
     * @param allVersions
     * @param formData
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static getFileMetadataApiV2PublicFilesFileIdMetadataGet(
        fileId: string,
        version?: number,
        allVersions: boolean = false,
        formData?: Body_get_file_metadata_api_v2_public_files__file_id__metadata_get,
    ): CancelablePromise<Array<MetadataOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_files/${fileId}/metadata`,
            query: {
                'version': version,
                'all_versions': allVersions,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}