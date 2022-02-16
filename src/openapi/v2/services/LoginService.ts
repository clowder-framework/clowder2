/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserIn } from '../models/UserIn';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class LoginService {

    /**
     * Login
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loginApiV2LoginPost(
        requestBody: UserIn,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/login`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Unprotected
     * @returns any Successful Response
     * @throws ApiError
     */
    public static unprotectedApiV2UnprotectedGet(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/unprotected`,
        });
    }

    /**
     * Protected
     * @returns any Successful Response
     * @throws ApiError
     */
    public static protectedApiV2ProtectedGet(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/protected`,
        });
    }

}