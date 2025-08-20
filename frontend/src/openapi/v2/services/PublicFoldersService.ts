/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicFoldersService {

    /**
     * Download Folder
     * @param folderId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFolderApiV2PublicFoldersFolderIdPathGet(
        folderId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_folders/${folderId}/path`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}