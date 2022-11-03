/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventListenerIn } from '../models/EventListenerIn';
import type { EventListenerOut } from '../models/EventListenerOut';
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
     * @param skip
     * @param limit
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static getListenersApiV2ListenersGet(
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<EventListenerOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners`,
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