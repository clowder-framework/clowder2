/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserIn } from '../models/UserIn';
import type { UserLogin } from '../models/UserLogin';
import type { UserOut } from '../models/UserOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class LoginService {

    /**
     * Save User
     * @param requestBody
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static saveUserApiV2UsersPost(
        requestBody: UserIn,
    ): CancelablePromise<UserOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/users`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Login
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loginApiV2LoginPost(
        requestBody: UserLogin,
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
     * Get Admin
     * @param datasetId
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static getAdminApiV2UsersMeIsAdminGet(
        datasetId?: string,
    ): CancelablePromise<boolean> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/me/is_admin`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Admin Mode
     * Get Admin mode from User Object.
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static getAdminModeApiV2UsersMeAdminModeGet(): CancelablePromise<boolean> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/me/admin_mode`,
        });
    }

    /**
     * Set Admin Mode
     * Set Admin mode from User Object.
     * @param adminModeOn
     * @param datasetId
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static setAdminModeApiV2UsersMeAdminModePost(
        adminModeOn: boolean,
        datasetId?: string,
    ): CancelablePromise<boolean> {
        return __request({
            method: 'POST',
            path: `/api/v2/users/me/admin_mode`,
            query: {
                'admin_mode_on': adminModeOn,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Set Admin
     * @param useremail
     * @param datasetId
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static setAdminApiV2UsersSetAdminUseremailPost(
        useremail: string,
        datasetId?: string,
    ): CancelablePromise<UserOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/users/set_admin/${useremail}`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Revoke Admin
     * @param useremail
     * @param datasetId
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static revokeAdminApiV2UsersRevokeAdminUseremailPost(
        useremail: string,
        datasetId?: string,
    ): CancelablePromise<UserOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/users/revoke_admin/${useremail}`,
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}