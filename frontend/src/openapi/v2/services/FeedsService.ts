/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FeedIn } from '../models/FeedIn';
import type { FeedListener } from '../models/FeedListener';
import type { FeedOut } from '../models/FeedOut';
import type { Paged } from '../models/Paged';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class FeedsService {

    /**
     * Get Feeds
     * Fetch all existing Feeds.
     * @param searchTerm
     * @param skip
     * @param limit
     * @param datasetId
     * @param enableAdmin
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getFeedsApiV2FeedsGet(
        searchTerm?: string,
        skip?: number,
        limit: number = 10,
        datasetId?: string,
        enableAdmin: boolean = false,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/feeds`,
            query: {
                'searchTerm': searchTerm,
                'skip': skip,
                'limit': limit,
                'dataset_id': datasetId,
                'enable_admin': enableAdmin,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save Feed
     * Create a new Feed (i.e. saved search) in the database.
     * @param requestBody
     * @returns FeedOut Successful Response
     * @throws ApiError
     */
    public static saveFeedApiV2FeedsPost(
        requestBody: FeedIn,
    ): CancelablePromise<FeedOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/feeds`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Feed
     * Fetch an existing saved search Feed.
     * @param feedId
     * @param enableAdmin
     * @param datasetId
     * @returns FeedOut Successful Response
     * @throws ApiError
     */
    public static getFeedApiV2FeedsFeedIdGet(
        feedId: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<FeedOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/feeds/${feedId}`,
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
     * Edit Feed
     * Update the information about an existing Feed..
     *
     * Arguments:
     * feed_id -- UUID of the feed to be udpated
     * feed_in -- JSON object including updated information
     * @param feedId
     * @param requestBody
     * @param enableAdmin
     * @param datasetId
     * @returns FeedOut Successful Response
     * @throws ApiError
     */
    public static editFeedApiV2FeedsFeedIdPut(
        feedId: string,
        requestBody: FeedIn,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<FeedOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/feeds/${feedId}`,
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
     * Delete Feed
     * Delete an existing saved search Feed.
     * @param feedId
     * @param enableAdmin
     * @param datasetId
     * @returns FeedOut Successful Response
     * @throws ApiError
     */
    public static deleteFeedApiV2FeedsFeedIdDelete(
        feedId: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<FeedOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/feeds/${feedId}`,
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
     * Associate Listener
     * Associate an existing Event Listener with a Feed, e.g. so it will be triggered on new Feed results.
     *
     * Arguments:
     * feed_id: Feed that should have new Event Listener associated
     * listener: JSON object with "listener_id" field and "automatic" bool field (whether to auto-trigger on new data)
     * @param feedId
     * @param requestBody
     * @param enableAdmin
     * @param datasetId
     * @returns FeedOut Successful Response
     * @throws ApiError
     */
    public static associateListenerApiV2FeedsFeedIdListenersPost(
        feedId: string,
        requestBody: FeedListener,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<FeedOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/feeds/${feedId}/listeners`,
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
     * Disassociate Listener
     * Disassociate an Event Listener from a Feed.
     *
     * Arguments:
     * feed_id: UUID of search Feed that is being changed
     * listener_id: UUID of Event Listener that should be disassociated
     * @param feedId
     * @param listenerId
     * @param enableAdmin
     * @param datasetId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static disassociateListenerApiV2FeedsFeedIdListenersListenerIdDelete(
        feedId: string,
        listenerId: string,
        enableAdmin: boolean = false,
        datasetId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/feeds/${feedId}/listeners/${listenerId}`,
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