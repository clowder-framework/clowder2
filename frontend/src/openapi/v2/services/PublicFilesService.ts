/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FileOut } from '../models/FileOut';
import type { FileVersion } from '../models/FileVersion';
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
            path: `/api/v2/public/files/${fileId}/summary`,
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
            path: `/api/v2/public/files/${fileId}/version_details`,
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
            path: `/api/v2/public/files/${fileId}/versions`,
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
            path: `/api/v2/public/files/${fileId}`,
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
            path: `/api/v2/public/files/${fileId}/thumbnail`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}