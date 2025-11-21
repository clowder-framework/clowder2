/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ExtractionsService {

    /**
     * Submit file for extraction by a specific extractor
     * Extractions for Files.
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postExtractions(
        id: string,
        requestBody: {
            parameters?: Array<string>;
            /**
             * the extractor Id
             */
            extractor?: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/extractions`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Cancel a submitted file extraction.
     * Extractions for file.
     * @param id
     * @param msgId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteExtractions(
        id: string,
        msgId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/files/${id}/extractions/${msgId}`,
        });
    }

    /**
     * Submit dataset for extraction by a specific extractor
     * Extractions for dataset.
     * @param dsId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postExtractions1(
        dsId: string,
        requestBody: {
            parameters?: Array<string>;
            /**
             * the extractor Id
             */
            extractor?: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/datasets/${dsId}/extractions`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Cancel a submitted dataset extraction.
     * Extractions for dataset.
     * @param dsId
     * @param msgId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteExtractions1(
        dsId: string,
        msgId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/datasets/${dsId}/extractions/${msgId}`,
        });
    }

    /**
     * Lists servers IPs running the extractors
     * Extractions for Files.
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractions(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractions/servers_ips`,
        });
    }

    /**
     * Lists the currently running extractors
     * Extractions for Files.
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractions1(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractions/extractors_names`,
        });
    }

    /**
     * Uploads a file for extraction using the file's URL
     * Saves the uploaded file and sends it for extraction. If the optional URL
     * parameter extract is set to false, it does not send the file for
     * extraction. Does not index the file.
     *
     * @param extract default as true
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postExtractions2(
        extract?: boolean,
        requestBody?: Array<any>,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/extractions/upload_url`,
            query: {
                'extract': extract,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Uploads a file for extraction of metadata and returns file id
     * Saves the uploaded file and sends it for extraction to Rabbitmq. If the
     * optional URL parameter extract is set to false, it does not send the
     * file for extraction. Does not index the file. Same as upload() except
     * for upload()
     *
     * @param formData
     * @param extract default as true
     * @param showPreviews default as DatasetLevel
     * @returns any OK
     * @throws ApiError
     */
    public static postExtractions3(
        formData: any,
        extract?: boolean,
        showPreviews?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/extractions/upload_file`,
            query: {
                'extract': extract,
                'showPreviews': showPreviews,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * Lists the input file format supported by currenlty running extractors
     * Extractions for Files.
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractions2(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractions/supported_input_types`,
        });
    }

    /**
     * Uploads files for a given list of files' URLs
     * Saves the uploaded files and sends it for extraction. Does not index the
     * files. Returns id for the web resource
     *
     * @returns any OK
     * @throws ApiError
     */
    public static postExtractions4(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/extractions/multiple_uploadby_url`,
        });
    }

    /**
     * Checks for the extraction statuses of all files
     * Returns a list (file id, status of extractions)
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractions3(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractions/${id}/statuses`,
        });
    }

    /**
     * Lists dts extraction requests information
     * Extractions for Files.
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractions4(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractions/requests`,
        });
    }

    /**
     * Provides the metadata extracted from the file
     * Retruns Status of extractions and metadata extracted so far
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractions5(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractions/${id}/metadata`,
        });
    }

    /**
     * Lists the currenlty details running extractors
     * Extractions for Files.
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractions6(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractions/extractors_details`,
        });
    }

    /**
     * Checks for the status of all extractors processing the file with id
     * A list of status of all extractors responsible for extractions on the
     * file and the final status of extraction job
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getExtractions7(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/extractions/${id}/status`,
        });
    }

    /**
     * Submit all selected files for extraction
     * Submit all selected files for extraction.
     *
     * @param dsId
     * @param fileIds
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postExtractions5(
        dsId: string,
        fileIds: string,
        requestBody: {
            parameters?: Array<string>;
            /**
             * the extractor Id
             */
            extractor?: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/selected/submit/${dsId}/${fileIds}`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Not authorized`,
            },
        });
    }

}