/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Status } from '../models/Status';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class StatusService {

    /**
     * Add Thumbnail
     * @returns Status Successful Response
     * @throws ApiError
     */
    public static addThumbnailApiV2StatusGet(): CancelablePromise<Status> {
        return __request({
            method: 'GET',
            path: `/api/v2/status`,
        });
    }

}