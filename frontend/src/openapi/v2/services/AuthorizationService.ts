/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthorizationBase } from '../models/AuthorizationBase';
import type { AuthorizationDB } from '../models/AuthorizationDB';
import type { AuthorizationFile } from '../models/AuthorizationFile';
import type { AuthorizationMetadata } from '../models/AuthorizationMetadata';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class AuthorizationService {

    /**
     * Save Authorization
     * Save authorization info in Mongo. This is a triple of dataset_id/user_id/role/group_id.
     * @param requestBody
     * @returns AuthorizationDB Successful Response
     * @throws ApiError
     */
    public static saveAuthorizationApiV2AuthorizationsPost(
        requestBody: AuthorizationBase,
    ): CancelablePromise<AuthorizationDB> {
        return __request({
            method: 'POST',
            path: `/api/v2/authorizations`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Role
     * Retrieve role of user for a specific dataset.
     * @param datasetId
     * @returns AuthorizationDB Successful Response
     * @throws ApiError
     */
    public static getDatasetRoleApiV2AuthorizationsDatasetsDatasetIdRoleGet(
        datasetId: string,
    ): CancelablePromise<AuthorizationDB> {
        return __request({
            method: 'GET',
            path: `/api/v2/authorizations/datasets/${datasetId}/role`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Role Viewer
     * Used for testing only. Returns true if user has viewer permission on dataset, otherwise throws a 403 Forbidden HTTP exception.
     * See `routers/authorization.py` for more info.
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDatasetRoleViewerApiV2AuthorizationsDatasetsDatasetIdRoleViewerGet(
        datasetId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/authorizations/datasets/${datasetId}/role/viewer`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Dataset Role Owner
     * Used for testing only. Returns true if user has owner permission on dataset, otherwise throws a 403 Forbidden HTTP exception.
     * See `routers/authorization.py` for more info.
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getDatasetRoleOwnerApiV2AuthorizationsDatasetsDatasetIdRoleOwnerGet(
        datasetId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/authorizations/datasets/${datasetId}/role/owner`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get File Role
     * Retrieve role of user for an individual file. Role cannot change between file versions.
     * @param fileId
     * @returns AuthorizationFile Successful Response
     * @throws ApiError
     */
    public static getFileRoleApiV2AuthorizationsFilesFileIdRoleGet(
        fileId: string,
    ): CancelablePromise<AuthorizationFile> {
        return __request({
            method: 'GET',
            path: `/api/v2/authorizations/files/${fileId}/role`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Metadata Role
     * Retrieve role of user for metadata. Role cannot change between metadata versions.
     * @param metadataId
     * @returns AuthorizationMetadata Successful Response
     * @throws ApiError
     */
    public static getMetadataRoleApiV2AuthorizationsMetadataMetadataIdRoleGet(
        metadataId: string,
    ): CancelablePromise<AuthorizationMetadata> {
        return __request({
            method: 'GET',
            path: `/api/v2/authorizations/metadata/${metadataId}/role`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}