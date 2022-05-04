/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class FoldersService {

    /**
     * Download File
     * @param folderId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadFileApiV2FoldersFolderIdPathGet(
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

}