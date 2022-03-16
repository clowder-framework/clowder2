/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserOut } from '../models/UserOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * Get Users
     * @param skip
     * @param limit
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static getUsersApiV2UsersGet(
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<UserOut>> {
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
     * Get User
     * @param userId
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static getUserApiV2UsersUserIdGet(
        userId: string,
    ): CancelablePromise<UserOut> {
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
     * @param username
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static getUserByNameApiV2UsersUsernameUsernameGet(
        username: string,
    ): CancelablePromise<UserOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/username/${username}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}