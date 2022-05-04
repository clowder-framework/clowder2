/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class LogosService {

    /**
     * List logos
     * List logos known to system
     * @returns any OK
     * @throws ApiError
     */
    public static getLogos(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/logos`,
        });
    }

    /**
     * Upload file
     * Files uploaded to this endpoint will be marked as special files, such as
     * favicon.png, logo.png. The file needs to be specified with image.
     *
     * @returns any OK
     * @throws ApiError
     */
    public static postLogos(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/logos`,
        });
    }

    /**
     * Get logo
     * Return logo information
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getLogos1(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/logos/${id}`,
        });
    }

    /**
     * Set logo
     * Updates logo information
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static putLogos(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'PUT',
            path: `/logos/${id}`,
        });
    }

    /**
     * Delete file
     * Delete a static file
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteLogos(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/logos/${id}`,
        });
    }

    /**
     * Download file
     * Download a static file, or the alternate file
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getLogos2(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/logos/${id}/blob`,
        });
    }

    /**
     * Get logo
     * Return logo information
     * @param path
     * @param name
     * @returns any OK
     * @throws ApiError
     */
    public static getLogos3(
        path: string,
        name: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/logos/${path}/${name}`,
        });
    }

    /**
     * Set logo
     * Updates logo information
     * @param path
     * @param name
     * @returns any OK
     * @throws ApiError
     */
    public static putLogos1(
        path: string,
        name: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'PUT',
            path: `/logos/${path}/${name}`,
        });
    }

    /**
     * Delete file
     * Delete a static file
     * @param path
     * @param name
     * @returns any OK
     * @throws ApiError
     */
    public static deleteLogos1(
        path: string,
        name: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/logos/${path}/${name}`,
        });
    }

    /**
     * Download file
     * Download a static file, or the alternate file
     * @param path
     * @param name
     * @returns any OK
     * @throws ApiError
     */
    public static getLogos4(
        path: string,
        name: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/logos/${path}/${name}/blob`,
        });
    }

}