/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserIn } from '../models/UserIn';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * Login
     * Redirect to keycloak login page.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loginApiV2AuthLoginGet(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth/login`,
        });
    }

    /**
     * Login
     * Client can use this to login when redirect is not available.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loginApiV2AuthLoginPost(
        requestBody: UserIn,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/auth/login`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Logout
     * Logout of keycloak.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static logoutApiV2AuthLogoutGet(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth/logout`,
        });
    }

    /**
     * Auth
     * Redirect endpoint Keycloak redirects to after login.
     * @param code
     * @returns any Successful Response
     * @throws ApiError
     */
    public static authApiV2AuthGet(
        code: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth`,
            query: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}