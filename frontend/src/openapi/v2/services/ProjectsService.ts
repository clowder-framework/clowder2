/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Paged } from '../models/Paged';
import type { ProjectIn } from '../models/ProjectIn';
import type { ProjectOut } from '../models/ProjectOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ProjectsService {

    /**
     * Get Projects
     * @param skip
     * @param limit
     * @param mine
     * @param enableAdmin
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getProjectsApiV2ProjectsGet(
        skip?: number,
        limit: number = 10,
        mine: boolean = false,
        enableAdmin: boolean = false,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/projects`,
            query: {
                'skip': skip,
                'limit': limit,
                'mine': mine,
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save Project
     * @param requestBody
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static saveProjectApiV2ProjectsPost(
        requestBody: ProjectIn,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/projects`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Dataset
     * @param projectId
     * @param datasetId
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static addDatasetApiV2ProjectsProjectIdAddDatasetDatasetIdPost(
        projectId: string,
        datasetId: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/projects/${projectId}/add_dataset/${datasetId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Dataset
     * @param projectId
     * @param datasetId
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static removeDatasetApiV2ProjectsProjectIdRemoveDatasetDatasetIdPost(
        projectId: string,
        datasetId: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/projects/${projectId}/remove_dataset/${datasetId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Folder
     * @param projectId
     * @param folderId
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static addFolderApiV2ProjectsProjectIdAddFolderFolderIdPost(
        projectId: string,
        folderId: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/projects/${projectId}/add_folder/${folderId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Folder
     * @param projectId
     * @param folderId
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static removeFolderApiV2ProjectsProjectIdRemoveFolderFolderIdPost(
        projectId: string,
        folderId: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/projects/${projectId}/remove_folder/${folderId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add File
     * @param projectId
     * @param fileId
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static addFileApiV2ProjectsProjectIdAddFileFileIdPost(
        projectId: string,
        fileId: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/projects/${projectId}/add_file/${fileId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove File
     * @param projectId
     * @param fileId
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static removeFileApiV2ProjectsProjectIdRemoveFileFileIdPost(
        projectId: string,
        fileId: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/projects/${projectId}/remove_file/${fileId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Project
     * @param projectId
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static getProjectApiV2ProjectsProjectIdGet(
        projectId: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/projects/${projectId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Project
     * @param projectId
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static deleteProjectApiV2ProjectsProjectIdDelete(
        projectId: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/projects/${projectId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Member
     * Add a new user to a group.
     * @param projectId
     * @param username
     * @param role
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static addMemberApiV2ProjectsProjectIdAddMemberUsernamePost(
        projectId: string,
        username: string,
        role?: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/projects/${projectId}/add_member/${username}`,
            query: {
                'role': role,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Member
     * Remove a user from a group.
     * @param projectId
     * @param username
     * @returns ProjectOut Successful Response
     * @throws ApiError
     */
    public static removeMemberApiV2ProjectsProjectIdRemoveMemberUsernamePost(
        projectId: string,
        username: string,
    ): CancelablePromise<ProjectOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/projects/${projectId}/remove_member/${username}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}