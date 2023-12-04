/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventListenerOut } from '../models/EventListenerOut';
import type { LegacyEventListenerIn } from '../models/LegacyEventListenerIn';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class ExtractorsService {

    /**
     * Save Legacy Listener
     * This will take a POST with Clowder v1 extractor_info included, and convert/update to a v2 Listener.
     * @param requestBody
     * @returns EventListenerOut Successful Response
     * @throws ApiError
     */
    public static saveLegacyListenerApiV2ExtractorsPost(
        requestBody: LegacyEventListenerIn,
    ): CancelablePromise<EventListenerOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/extractors`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}
