/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class FoldersService {

    /**
     * Download Folder
     * @param folderId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFolderApiV2FoldersFolderIdPathGet(
        folderId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/folders/${folderId}/path`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Folder
     * @param folderId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFolderApiV2FoldersFolderIdDelete(
        folderId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/folders/${folderId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}