/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserAPIKey } from '../models/UserAPIKey';
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

    /**
     * Generate User Api Key
     * List all api keys that user has created
     *
     * Arguments:
     * skip: number of page to skip
     * limit: number to limit per page
     * @param skip
     * @param limit
     * @returns UserAPIKey Successful Response
     * @throws ApiError
     */
    public static generateUserApiKeyApiV2UsersKeysGet(
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<UserAPIKey>> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/keys`,
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
     * Generate User Api Key
     * Generate an API key that confers the user's privileges.
     *
     * Arguments:
     * name: name of the api key
     * mins: number of minutes before expiration (0 for no expiration)
     * @param name
     * @param mins
     * @returns string Successful Response
     * @throws ApiError
     */
    public static generateUserApiKeyApiV2UsersKeysPost(
        name: string,
        mins: number = 30,
    ): CancelablePromise<string> {
        return __request({
            method: 'POST',
            path: `/api/v2/users/keys`,
            query: {
                'name': name,
                'mins': mins,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Generate User Api Key
     * Delete API keys given ID
     *
     * Arguments:
     * key_id: id of the apikey
     * @param keyId
     * @returns string Successful Response
     * @throws ApiError
     */
    public static generateUserApiKeyApiV2UsersKeysKeyIdDelete(
        keyId: string,
    ): CancelablePromise<string> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/users/keys/${keyId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}