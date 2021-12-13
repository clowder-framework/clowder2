/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ReportingService {

    /**
     * Download usage metrics report for files, datasets and collections as CSV.
     * Download usage metrics report for files, datasets and collections as a CSV file.
     * Must be a server admin to access the report.
     *
     * @returns binary A CSV with usage metrics
     * @throws ApiError
     */
    public static getReporting(): CancelablePromise<Blob> {
        return __request({
            method: 'GET',
            path: `/reports/metrics`,
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * Download usage metrics report for files as CSV.
     * Download usage metrics report for files as a CSV file.
     * Must be a server admin to access the report. Supports ISO8601 date range filters.
     *
     * @param since
     * @param until
     * @returns binary A CSV with usage metrics
     * @throws ApiError
     */
    public static getReporting1(
        since?: string,
        until?: string,
    ): CancelablePromise<Blob> {
        return __request({
            method: 'GET',
            path: `/reports/metrics/files`,
            query: {
                'since': since,
                'until': until,
            },
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * Download usage metrics report for datasets as CSV.
     * Download usage metrics report for datasets as a CSV file.
     * Must be a server admin to access the report. Supports ISO8601 date range filters.
     *
     * @param since
     * @param until
     * @returns binary A CSV with usage metrics
     * @throws ApiError
     */
    public static getReporting2(
        since?: string,
        until?: string,
    ): CancelablePromise<Blob> {
        return __request({
            method: 'GET',
            path: `/reports/metrics/datasets`,
            query: {
                'since': since,
                'until': until,
            },
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * Download usage metrics report for collections as CSV.
     * Download usage metrics report for collections as a CSV file.
     * Must be a server admin to access the report.
     *
     * @returns binary A CSV with usage metrics
     * @throws ApiError
     */
    public static getReporting3(): CancelablePromise<Blob> {
        return __request({
            method: 'GET',
            path: `/reports/metrics/collections`,
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * Download storage metrics report for spaces as CSV.
     * Download storage metrics report for files in a space as a CSV file. Space id is optional parameter.
     * Must be a server admin to access the report. Supports ISO8601 date range filters.
     *
     * @param space
     * @param since
     * @param until
     * @returns binary A CSV with usage metrics
     * @throws ApiError
     */
    public static getReporting4(
        space?: string,
        since?: string,
        until?: string,
    ): CancelablePromise<Blob> {
        return __request({
            method: 'GET',
            path: `/reports/storage/spaces`,
            query: {
                'space': space,
                'since': since,
                'until': until,
            },
            errors: {
                401: `Not authorized`,
            },
        });
    }

}