/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class FoldersService {

    /**
     * Create a Folder
     * New empty folder. Requires the ID of the dataset within the folder will
     * be created, and the parent information
     *
     * @param parentDatasetId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFolders(
        parentDatasetId: string,
        requestBody: {
            name?: string;
            parentId?: string;
            parentType?: 'dataset' | 'folder';
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/datasets/${parentDatasetId}/newFolder`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update folder name
     * Updates a folder's name
     * @param parentDatasetId
     * @param folderId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putFolders(
        parentDatasetId: string,
        folderId: string,
        requestBody: {
            name?: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'PUT',
            path: `/datasets/${parentDatasetId}/updateName/${folderId}`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete a folder
     * Deletes all the files and folder within a folder and then deletes itself
     * @param parentDatasetId
     * @param folderId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteFolders(
        parentDatasetId: string,
        folderId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/datasets/${parentDatasetId}/deleteFolder/${folderId}`,
        });
    }

}