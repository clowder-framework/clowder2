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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFileApiV2FilesFileIdGet(
        fileId: string,
        version?: number,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}`,
            query: {
                'version': version,
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
     * @returns FileOut Successful Response
     * @throws ApiError
     */
    public static updateFileApiV2FilesFileIdPut(
        fileId: string,
        formData: Body_update_file_api_v2_files__file_id__put,
    ): CancelablePromise<FileOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/files/${fileId}`,
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
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFileApiV2FilesFileIdDelete(
        fileId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/files/${fileId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get File Summary
     * @param fileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFileSummaryApiV2FilesFileIdSummaryGet(
        fileId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}/summary`,
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
    public static getFileVersionsApiV2FilesFileIdVersionsGet(
        fileId: string,
        skip?: number,
        limit: number = 20,
    ): CancelablePromise<Array<FileVersion>> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}/versions`,
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
     * Get File Extract
     * @param fileId
     * @param extractorName
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getFileExtractApiV2FilesFileIdExtractPost(
        fileId: string,
        extractorName: string,
        requestBody?: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/files/${fileId}/extract`,
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
     * Resubmit File Extractions
     * This route will check metadata. We get the extractors run from metadata from extractors.
     * Then they are resubmitted. At present parameters are not stored. This will change once Jobs are
     * implemented.
     *
     * Arguments:
     * file_id: Id of file
     * credentials: credentials of logged in user
     * db: MongoDB Client
     * rabbitmq_client: Rabbitmq Client
     * @param fileId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static resubmitFileExtractionsApiV2FilesFileIdResubmitExtractPost(
        fileId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/files/${fileId}/resubmit_extract`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}