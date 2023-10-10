/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_add_thumbnail_api_v2_thumbnails_post } from '../models/Body_add_thumbnail_api_v2_thumbnails_post';
import type { ThumbnailOut } from '../models/ThumbnailOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ThumbnailsService {

    /**
     * Add Thumbnail
     * Insert Thumbnail object into MongoDB (makes Clowder ID), then Minio
     * @param formData
     * @returns ThumbnailOut Successful Response
     * @throws ApiError
     */
    public static addThumbnailApiV2ThumbnailsPost(
        formData: Body_add_thumbnail_api_v2_thumbnails_post,
    ): CancelablePromise<ThumbnailOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/thumbnails`,
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download Thumbnail
     * @param thumbnailId
     * @param increment
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadThumbnailApiV2ThumbnailsThumbnailIdGet(
        thumbnailId: string,
        increment: boolean = false,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/thumbnails/${thumbnailId}`,
            query: {
                'increment': increment,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Thumbnail
     * @param thumbId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeThumbnailApiV2ThumbnailsThumbnailIdDelete(
        thumbId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/thumbnails/${thumbnailId}`,
            query: {
                'thumb_id': thumbId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}