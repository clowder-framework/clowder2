/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Paged } from '../models/Paged';
import type { UserAPIKeyOut } from '../models/UserAPIKeyOut';
import type { UserOut } from '../models/UserOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class UsersService {

    /**
     * Get Users
     * @param skip
     * @param limit
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getUsersApiV2UsersGet(
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Paged> {
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
     * Get User Api Keys
     * List all api keys that user has created
     *
     * Arguments:
     * skip: number of page to skip
     * limit: number to limit per page
     * @param skip
     * @param limit
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getUserApiKeysApiV2UsersKeysGet(
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Paged> {
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
     * Delete User Api Key
     * Delete API keys given ID
     *
     * Arguments:
     * key_id: id of the apikey
     * @param keyId
     * @returns UserAPIKeyOut Successful Response
     * @throws ApiError
     */
    public static deleteUserApiKeyApiV2UsersKeysKeyIdDelete(
        keyId: string,
    ): CancelablePromise<UserAPIKeyOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/users/keys/${keyId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Search Users
     * @param text
     * @param skip
     * @param limit
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static searchUsersApiV2UsersSearchGet(
        text: string,
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/search`,
            query: {
                'text': text,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Search Users Prefix
     * @param prefix
     * @param skip
     * @param limit
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static searchUsersPrefixApiV2UsersPrefixSearchGet(
        prefix: string,
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/prefixSearch`,
            query: {
                'prefix': prefix,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Profile
     * @returns UserOut Successful Response
     * @throws ApiError
     */
    public static getProfileApiV2UsersProfileGet(): CancelablePromise<UserOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/users/profile`,
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