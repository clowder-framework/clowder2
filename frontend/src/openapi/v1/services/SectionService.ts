/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class SectionService {

    /**
     * Add a section.
     * @param requestBody The body of the POST request.
     * @returns void
     * @throws ApiError
     */
    public static postSection(
        requestBody: {
            file_id: string;
        },
    ): CancelablePromise<void> {
        return __request({
            method: 'POST',
            path: `/sections`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `No "file_id" specified, request body.`,
            },
        });
    }

    /**
     * Get a section.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getSection(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/sections/${id}`,
        });
    }

    /**
     * Delete a section.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteSection(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/sections/${id}`,
        });
    }

    /**
     * Add comment to a section.
     * @param id
     * @param requestBody The body of the POST request.
     * @returns any OK
     * @throws ApiError
     */
    public static postSection1(
        id: string,
        requestBody: {
            text: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/sections/${id}/comments`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Add description to a section.
     * @param id
     * @param requestBody The body of the POST request.
     * @returns any OK
     * @throws ApiError
     */
    public static postSection2(
        id: string,
        requestBody: {
            description: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/sections/${id}/description`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                400: `no section description specified.`,
            },
        });
    }

    /**
     * Add thumbnail to section.
     * @param id
     * @param thumbnailId
     * @returns any OK
     * @throws ApiError
     */
    public static postSection3(
        id: string,
        thumbnailId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/sections/${id}/thumbnails/${thumbnailId}`,
            errors: {
                400: `Thumbnail not found.`,
            },
        });
    }

    /**
     * Get tags of a section.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getSection1(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/sections/${id}/tags`,
        });
    }

    /**
     * Add tags to section.
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postSection4(
        id: string,
        requestBody: {
            tags: Array<string>;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/sections/${id}/tags`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Delete tags from section.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteSection1(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/sections/${id}/tags`,
        });
    }

    /**
     * @deprecated
     * remove a tag from a section
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postSection5(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/sections/${id}/tags/remove`,
        });
    }

    /**
     * Delete all tags from section.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postSection6(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/sections/${id}/tags/remove_all`,
        });
    }

}