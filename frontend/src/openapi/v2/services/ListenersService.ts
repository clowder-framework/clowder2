/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventListenerIn } from '../models/EventListenerIn';
import type { EventListenerOut } from '../models/EventListenerOut';
import type { ExecutionLogs } from '../models/ExecutionLogs';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ListenersService {

    /**
     * Get Listeners
     * Get a list of all Event Listeners in the db.
     *
     * Arguments:
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * category -- filter by category has to be exact match
     * label -- filter by label has to be exact match
     * @param skip
     * @param limit
     * @param category
     * @param label
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static getListenersApiV2ListenersGet(
        skip?: number,
        limit: number = 2,
        category?: string,
        label?: string,
    ): CancelablePromise<Array<EventListenerOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners`,
            query: {
                'skip': skip,
                'limit': limit,
                'category': category,
                'label': label,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save Listener
     * Register a new Event Listener with the system.
     * @param requestBody
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static saveListenerApiV2ListenersPost(
        requestBody: EventListenerIn,
    ): CancelablePromise<EventListenerOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/listeners`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Search Listeners
     * Search all Event Listeners in the db based on text.
     *
     * Arguments:
     * text -- any text matching name or description
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * @param text
     * @param skip
     * @param limit
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static searchListenersApiV2ListenersSearchGet(
        text: string = '',
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<EventListenerOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/search`,
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
     * List Categories
     * Get all the distinct categories of registered listeners in the db
     *
     * Arguments:
     * @returns string Successful Response
     * @throws ApiError
     */
    public static listCategoriesApiV2ListenersCategoriesGet(): CancelablePromise<Array<string>> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/categories`,
        });
    }

    /**
     * List Default Labels
     * Get all the distinct default labels of registered listeners in the db
     *
     * Arguments:
     * @returns string Successful Response
     * @throws ApiError
     */
    public static listDefaultLabelsApiV2ListenersDefaultLabelsGet(): CancelablePromise<Array<string>> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/defaultLabels`,
        });
    }

    /**
     * Get Execution Logs
     * Get a list of all execution logs the db.
     *
     * Arguments:
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * @param skip
     * @param limit
     * @returns ExecutionLogs Successful Response
     * @throws ApiError
     */
    public static getExecutionLogsApiV2ListenersLogsGet(
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<ExecutionLogs>> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/logs`,
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
     * Get Execution Logs By Extractor
     * Get a list of all execution logs the db.
     *
     * Arguments:
     * extractor_id -- extractor id
     * job_id -- execution running job id
     * status -- filter by status
     * user_id -- filter by user id
     * file_id -- filter by file id
     * dataset_id -- filter by dataset id
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * @param extractorId
     * @param jobId
     * @param status
     * @param userId
     * @param fileId
     * @param datasetId
     * @param skip
     * @param limit
     * @returns ExecutionLogs Successful Response
     * @throws ApiError
     */
    public static getExecutionLogsByExtractorApiV2ListenersLogsExtractorsExtractorIdGet(
        extractorId: string,
        jobId?: string,
        status?: string,
        userId?: string,
        fileId?: string,
        datasetId?: string,
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<ExecutionLogs>> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/logs/extractors/${extractorId}`,
            query: {
                'job_id': jobId,
                'status': status,
                'user_id': userId,
                'file_id': fileId,
                'dataset_id': datasetId,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Execution Logs By Job
     * Get a list of all execution logs the db.
     *
     * Arguments:
     * extractor_id -- extractor id
     * job_id -- execution running job id
     * status -- filter by status
     * user_id -- filter by user id
     * file_id -- filter by file id
     * dataset_id -- filter by dataset id
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * @param jobId
     * @param executionId
     * @param status
     * @param userId
     * @param fileId
     * @param datasetId
     * @param skip
     * @param limit
     * @returns ExecutionLogs Successful Response
     * @throws ApiError
     */
    public static getExecutionLogsByJobApiV2ListenersLogsJobsJobIdGet(
        jobId: string,
        executionId?: string,
        status?: string,
        userId?: string,
        fileId?: string,
        datasetId?: string,
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<ExecutionLogs>> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/logs/jobs/${jobId}`,
            query: {
                'execution_id': executionId,
                'status': status,
                'user_id': userId,
                'file_id': fileId,
                'dataset_id': datasetId,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Log
     * Endpoint to get one match log given log id
     *
     * Arguments:
     * log_id -- log ID
     * @param logId
     * @returns ExecutionLogs Successful Response
     * @throws ApiError
     */
    public static getLogApiV2ListenersLogsLogIdGet(
        logId: string,
    ): CancelablePromise<ExecutionLogs> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/logs/${logId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Listener
     * Return JSON information about an Event Listener if it exists.
     * @param listenerId
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static getListenerApiV2ListenersListenerIdGet(
        listenerId: string,
    ): CancelablePromise<EventListenerOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/${listenerId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Edit Listener
     * Update the information about an existing Event Listener..
     *
     * Arguments:
     * listener_id -- UUID of the listener to be udpated
     * listener_in -- JSON object including updated information
     * @param listenerId
     * @param requestBody
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static editListenerApiV2ListenersListenerIdPut(
        listenerId: string,
        requestBody: EventListenerIn,
    ): CancelablePromise<EventListenerOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/listeners/${listenerId}`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Listener
     * Remove an Event Listener from the database. Will not clear event history for the listener.
     * @param listenerId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteListenerApiV2ListenersListenerIdDelete(
        listenerId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/listeners/${listenerId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}