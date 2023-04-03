/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthorizationBase } from '../models/AuthorizationBase';
import type { AuthorizationDB } from '../models/AuthorizationDB';
import type { AuthorizationMetadata } from '../models/AuthorizationMetadata';
import type { RoleType } from '../models/RoleType';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class AuthorizationService {

    /**
     * Save Authorization
     * Save authorization info in Mongo. This is a triple of dataset_id/user_id/role/group_id.
     * @param datasetId
     * @param requestBody
     * @returns AuthorizationDB Successful Response
     * @throws ApiError
     */
    public static saveAuthorizationApiV2AuthorizationsDatasetsDatasetIdPost(
        datasetId: string,
        requestBody: AuthorizationBase,
    ): CancelablePromise<AuthorizationDB> {
        return __request({
            method: 'POST',
            path: `/api/v2/authorizations/datasets/${datasetId}`,
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
     * @returns RoleType Successful Response
     * @throws ApiError
     */
    public static getFileRoleApiV2AuthorizationsFilesFileIdRoleGet(
        fileId: string,
    ): CancelablePromise<RoleType> {
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
     * Retrieve role of user for group. Group roles can be OWNER, EDITOR, or VIEWER (for regular Members).
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

    /**
     * Get Group Role
     * Retrieve role of user on a particular group (i.e. whether they can change group memberships).
     * @param groupId
     * @returns RoleType Successful Response
     * @throws ApiError
     */
    public static getGroupRoleApiV2AuthorizationsGroupsGroupIdRoleGet(
        groupId: string,
    ): CancelablePromise<RoleType> {
        return __request({
            method: 'GET',
            path: `/api/v2/authorizations/groups/${groupId}/role`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Set Group User Role
     * Assign a user role for managing the group. Right now only support Editor and Viewer
     * @param groupId
     * @param username
     * @param role
     * @returns AuthorizationDB Successful Response
     * @throws ApiError
     */
    public static setGroupUserRoleApiV2AuthorizationsGroupsGroupIdUserRoleUsernameRolePost(
        groupId: string,
        username: string,
        role: RoleType,
    ): CancelablePromise<AuthorizationDB> {
        return __request({
            method: 'POST',
            path: `/api/v2/authorizations/groups/${groupId}/user_role/${username}/${role}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Set Dataset Group Role
     * Assign an entire group a specific role for a dataset.
     * @param datasetId
     * @param groupId
     * @param role
     * @returns AuthorizationDB Successful Response
     * @throws ApiError
     */
    public static setDatasetGroupRoleApiV2AuthorizationsDatasetsDatasetIdGroupRoleGroupIdRolePost(
        datasetId: string,
        groupId: string,
        role: RoleType,
    ): CancelablePromise<AuthorizationDB> {
        return __request({
            method: 'POST',
            path: `/api/v2/authorizations/datasets/${datasetId}/group_role/${groupId}/${role}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Set Dataset User Role
     * Assign a single user a specific role for a dataset.
     * @param datasetId
     * @param username
     * @param role
     * @returns AuthorizationDB Successful Response
     * @throws ApiError
     */
    public static setDatasetUserRoleApiV2AuthorizationsDatasetsDatasetIdUserRoleUsernameRolePost(
        datasetId: string,
        username: string,
        role: RoleType,
    ): CancelablePromise<AuthorizationDB> {
        return __request({
            method: 'POST',
            path: `/api/v2/authorizations/datasets/${datasetId}/user_role/${username}/${role}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Dataset Group Role
     * Remove any role the group has with a specific dataset.
     * @param datasetId
     * @param groupId
     * @returns AuthorizationDB Successful Response
     * @throws ApiError
     */
    public static removeDatasetGroupRoleApiV2AuthorizationsDatasetsDatasetIdGroupRoleGroupIdDelete(
        datasetId: string,
        groupId: string,
    ): CancelablePromise<AuthorizationDB> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/authorizations/datasets/${datasetId}/group_role/${groupId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Dataset User Role
     * Remove any role the user has with a specific dataset.
     * @param datasetId
     * @param username
     * @returns AuthorizationDB Successful Response
     * @throws ApiError
     */
    public static removeDatasetUserRoleApiV2AuthorizationsDatasetsDatasetIdUserRoleUsernameDelete(
        datasetId: string,
        username: string,
    ): CancelablePromise<AuthorizationDB> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/authorizations/datasets/${datasetId}/user_role/${username}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}