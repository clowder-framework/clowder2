/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserLogin } from '../models/UserLogin';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * Register
     * @returns any Successful Response
     * @throws ApiError
     */
    public static registerApiV2AuthRegisterGet(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth/register`,
        });
    }

    /**
     * Loginget
     * Redirect to keycloak login page.
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loginGetApiV2AuthLoginGet(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth/login`,
        });
    }

    /**
     * Loginpost
     * Client can use this to login when redirect is not available.
     * @param requestBody
     * @returns any Successful Response
     * @throws ApiError
     */
    public static loginPostApiV2AuthLoginPost(
        requestBody: UserLogin,
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

    /**
     * Token
     * @param code
     * @returns any Successful Response
     * @throws ApiError
     */
    public static tokenApiV2AuthTokenGet(
        code: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth/token`,
            query: {
                'code': code,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Refresh Token
     * @returns any Successful Response
     * @throws ApiError
     */
    public static refreshTokenApiV2AuthRefreshTokenGet(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth/refresh_token`,
        });
    }

    /**
     * Get Idenity Provider Token
     * Get identity provider JWT token from keyclok. Keycloak must be configured to store external tokens.
     * @param identityProvider
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getIdenityProviderTokenApiV2AuthBrokerIdentityProviderTokenGet(
        identityProvider: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/auth/broker/${identityProvider}/token`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}