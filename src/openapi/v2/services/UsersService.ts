/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserDB } from '../models/UserDB';
import type { UserIn } from '../models/UserIn';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * Get Users
     * @param skip
     * @param limit
     * @returns UserDB Successful Response
     * @throws ApiError
     */
    public static getUsersApiV2UsersGet(
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<UserDB>> {
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
     * @returns UserDB Successful Response
     * @throws ApiError
     */
    public static saveUserApiV2UsersPost(
        requestBody: UserIn,
    ): CancelablePromise<UserDB> {
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
     * @returns UserDB Successful Response
     * @throws ApiError
     */
    public static getUserApiV2UsersUserIdGet(
        userId: string,
    ): CancelablePromise<UserDB> {
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
     * @returns UserDB Successful Response
     * @throws ApiError
     */
    public static getUserByNameApiV2UsersUsernameNameGet(
        name: string,
    ): CancelablePromise<UserDB> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/username/${name}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}