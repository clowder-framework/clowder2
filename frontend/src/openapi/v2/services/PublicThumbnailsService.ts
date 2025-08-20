/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicThumbnailsService {

    /**
     * Download Thumbnail
     * @param thumbnailId
     * @param increment
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadThumbnailApiV2PublicThumbnailsThumbnailIdGet(
        thumbnailId: string,
        increment: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_thumbnails/${thumbnailId}`,
            query: {
                'increment': increment,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}