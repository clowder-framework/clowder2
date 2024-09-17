/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventListenerIn } from '../models/EventListenerIn';
import type { EventListenerOut } from '../models/EventListenerOut';
import type { Paged } from '../models/Paged';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ListenersService {

    /**
     * Get Instance Id
     * @returns any Successful Response
     * @throws ApiError
     */
    public static getInstanceIdApiV2ListenersInstanceGet(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/instance`,
        });
    }

    /**
     * Get Listeners
     * Get a list of all Event Listeners in the db.
     *
     * Arguments:
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * heartbeat_interval -- number of seconds after which a listener is considered dead
     * category -- filter by category has to be exact match
     * label -- filter by label has to be exact match
     * alive_only -- filter by alive status
     * process -- filter by file or dataset type (if specified)
     * dataset_id -- restrict to listeners that run on the given dataset or a file within (if not otherwise permitted)
     * all -- boolean stating if we want to show all listeners irrespective of admin and admin_mode
     * @param skip
     * @param limit
     * @param heartbeatInterval
     * @param category
     * @param label
     * @param aliveOnly
     * @param process
     * @param datasetId
     * @param all
     * @param enableAdmin
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getListenersApiV2ListenersGet(
        skip?: number,
        limit: number = 2,
        heartbeatInterval: number = 300,
        category?: string,
        label?: string,
        aliveOnly: boolean = false,
        process?: string,
        datasetId?: string,
        all: boolean = false,
        enableAdmin: boolean = false,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners`,
            query: {
                'skip': skip,
                'limit': limit,
                'heartbeat_interval': heartbeatInterval,
                'category': category,
                'label': label,
                'alive_only': aliveOnly,
                'process': process,
                'dataset_id': datasetId,
                'all': all,
                'enable_admin': enableAdmin,
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
     * @param heartbeatInterval
     * @param process
     * @param datasetId
     * @param enableAdmin
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static searchListenersApiV2ListenersSearchGet(
        text: string = '',
        skip?: number,
        limit: number = 2,
        heartbeatInterval: number = 300,
        process?: string,
        datasetId?: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/search`,
            query: {
                'text': text,
                'skip': skip,
                'limit': limit,
                'heartbeat_interval': heartbeatInterval,
                'process': process,
                'dataset_id': datasetId,
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * List Categories
     * Get all the distinct categories of registered listeners in the db
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
     * Get Listener
     * Return JSON information about an Event Listener if it exists.
     * @param listenerId
     * @param enableAdmin
     * @param datasetId
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static getListenerApiV2ListenersListenerIdGet(
        listenerId: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<EventListenerOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/${listenerId}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
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
     * @param enableAdmin
     * @param datasetId
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static editListenerApiV2ListenersListenerIdPut(
        listenerId: string,
        requestBody: EventListenerIn,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<EventListenerOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/listeners/${listenerId}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
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
     * @param enableAdmin
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteListenerApiV2ListenersListenerIdDelete(
        listenerId: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/listeners/${listenerId}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Check Listener Livelihood
     * Return JSON information about an Event Listener if it exists.
     * @param listenerId
     * @param heartbeatInterval
     * @param enableAdmin
     * @param datasetId
     * @returns boolean Successful Response
     * @throws ApiError
     */
    public static checkListenerLivelihoodApiV2ListenersListenerIdStatusGet(
        listenerId: string,
        heartbeatInterval: number = 300,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<boolean> {
        return __request({
            method: 'GET',
            path: `/api/v2/listeners/${listenerId}/status`,
            query: {
                'heartbeat_interval': heartbeatInterval,
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Enable Listener
     * Enable an Event Listener. Only admins can enable listeners.
     *
     * Arguments:
     * listener_id -- UUID of the listener to be enabled
     * @param listenerId
     * @param enableAdmin
     * @param datasetId
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static enableListenerApiV2ListenersListenerIdEnablePut(
        listenerId: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<EventListenerOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/listeners/${listenerId}/enable`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Disable Listener
     * Disable an Event Listener. Only admins can enable listeners.
     *
     * Arguments:
     * listener_id -- UUID of the listener to be enabled
     * @param listenerId
     * @param enableAdmin
     * @param datasetId
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static disableListenerApiV2ListenersListenerIdDisablePut(
        listenerId: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<EventListenerOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/listeners/${listenerId}/disable`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add User Permission
     * @param listenerId
     * @param targetUser
     * @param enableAdmin
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addUserPermissionApiV2ListenersListenerIdUsersTargetUserPost(
        listenerId: string,
        targetUser: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/listeners/${listenerId}/users/${targetUser}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove User Permission
     * @param listenerId
     * @param targetUser
     * @param enableAdmin
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeUserPermissionApiV2ListenersListenerIdUsersTargetUserDelete(
        listenerId: string,
        targetUser: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/listeners/${listenerId}/users/${targetUser}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Group Permission
     * @param listenerId
     * @param targetGroup
     * @param enableAdmin
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addGroupPermissionApiV2ListenersListenerIdGroupsTargetGroupPost(
        listenerId: string,
        targetGroup: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/listeners/${listenerId}/groups/${targetGroup}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Group Permission
     * @param listenerId
     * @param targetGroup
     * @param enableAdmin
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeGroupPermissionApiV2ListenersListenerIdGroupsTargetGroupDelete(
        listenerId: string,
        targetGroup: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/listeners/${listenerId}/groups/${targetGroup}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Dataset Permission
     * @param listenerId
     * @param targetDataset
     * @param enableAdmin
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static addDatasetPermissionApiV2ListenersListenerIdDatasetsTargetDatasetPost(
        listenerId: string,
        targetDataset: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/api/v2/listeners/${listenerId}/datasets/${targetDataset}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Dataset Permission
     * @param listenerId
     * @param targetDataset
     * @param enableAdmin
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeDatasetPermissionApiV2ListenersListenerIdDatasetsTargetDatasetDelete(
        listenerId: string,
        targetDataset: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/listeners/${listenerId}/datasets/${targetDataset}`,
            query: {
                'enable_admin': enableAdmin,
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

}