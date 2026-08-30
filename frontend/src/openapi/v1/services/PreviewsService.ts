/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PreviewsService {

    /**
     * Upload a preview
     * Upload a preview
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static postPreviews(
        formData?: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/previews`,
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

}