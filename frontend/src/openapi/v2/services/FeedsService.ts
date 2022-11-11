/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { FeedIn } from '../models/FeedIn';
import type { FeedListener } from '../models/FeedListener';
import type { FeedOut } from '../models/FeedOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class FeedsService {

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
     * Delete Feed
     * Delete an existing saved search Feed.
     * @param feedId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteFeedApiV2FeedsFeedIdDelete(
        feedId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/feeds/${feedId}`,
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
     * @returns FeedOut Successful Response
     * @throws ApiError
     */
    public static associateListenerApiV2FeedsFeedIdListenersPost(
        feedId: string,
        requestBody: FeedListener,
    ): CancelablePromise<FeedOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/feeds/${feedId}/listeners`,
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
     * @returns FeedOut Successful Response
     * @throws ApiError
     */
    public static disassociateListenerApiV2FeedsFeedIdListenersListenerIdDelete(
        feedId: string,
        listenerId: string,
    ): CancelablePromise<FeedOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/feeds/${feedId}/listeners/${listenerId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}