/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { AuthDetails } from '../models/AuthDetails';
import type { User } from '../models/User';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * Get Users
     * @param skip
     * @param limit
     * @returns User Successful Response
     * @throws ApiError
     */
    public static getUsersApiV2UsersGet(
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<User>> {
        return __request({
            method: 'GET',
            path: `/api/v2/users`,
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save User
     * @param requestBody
     * @returns User Successful Response
     * @throws ApiError
     */
    public static saveUserApiV2UsersPost(
        requestBody: AuthDetails,
    ): CancelablePromise<User> {
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
     * Get User
     * @param userId
     * @returns User Successful Response
     * @throws ApiError
     */
    public static getUserApiV2UsersUserIdGet(
        userId: string,
    ): CancelablePromise<User> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/${userId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get User By Name
     * @param name
     * @returns User Successful Response
     * @throws ApiError
     */
    public static getUserByNameApiV2UsersUsernameNameGet(
        name: string,
    ): CancelablePromise<User> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/username/${name}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}