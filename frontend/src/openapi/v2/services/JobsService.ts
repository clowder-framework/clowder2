/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { EventListenerJobOut } from '../models/EventListenerJobOut';
import type { EventListenerJobUpdateOut } from '../models/EventListenerJobUpdateOut';
import type { Paged } from '../models/Paged';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class JobsService {

    /**
     * Get All Job Summary
     * Get a list of all jobs from the db.
     * Arguments:
     * listener_id -- listener id
     * status -- filter by status
     * user_id -- filter by user id
     * file_id -- filter by file id
     * dataset_id -- filter by dataset id
     * created: Optional[datetime] = None,
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * @param listenerId
     * @param status
     * @param userId
     * @param fileId
     * @param datasetId
     * @param created
     * @param skip
     * @param limit
     * @returns Paged Successful Response
     * @throws ApiError
     */
    public static getAllJobSummaryApiV2JobsGet(
        listenerId?: string,
        status?: string,
        userId?: string,
        fileId?: string,
        datasetId?: string,
        created?: string,
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Paged> {
        return __request({
            method: 'GET',
            path: `/api/v2/jobs`,
            query: {
                'listener_id': listenerId,
                'status': status,
                'user_id': userId,
                'file_id': fileId,
                'dataset_id': datasetId,
                'created': created,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Job Summary
     * @param jobId
     * @returns EventListenerJobOut Successful Response
     * @throws ApiError
     */
    public static getJobSummaryApiV2JobsJobIdSummaryGet(
        jobId: string,
    ): CancelablePromise<EventListenerJobOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/jobs/${jobId}/summary`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Job Updates
     * @param jobId
     * @returns EventListenerJobUpdateOut Successful Response
     * @throws ApiError
     */
    public static getJobUpdatesApiV2JobsJobIdUpdatesGet(
        jobId: string,
    ): CancelablePromise<Array<EventListenerJobUpdateOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/jobs/${jobId}/updates`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}