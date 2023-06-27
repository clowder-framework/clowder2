/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VisualizationConfigIn } from '../models/VisualizationConfigIn';
import type { VisualizationConfigOut } from '../models/VisualizationConfigOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class VisualizationsService {

    /**
     * Save Visualization Config
     * @param requestBody
     * @returns VisualizationConfigOut Successful Response
     * @throws ApiError
     */
    public static saveVisualizationConfigApiV2VisualizationsConfigPost(
        requestBody: VisualizationConfigIn,
    ): CancelablePromise<VisualizationConfigOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/visualizations/config`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Resource Vizconfig
     * @param resourceId
     * @returns VisualizationConfigOut Successful Response
     * @throws ApiError
     */
    public static getResourceVizconfigApiV2VisualizationsResourceIdConfigGet(
        resourceId: string,
    ): CancelablePromise<Array<VisualizationConfigOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/visualizations/${resourceId}/config`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Vizconfig
     * @param configId
     * @returns VisualizationConfigOut Successful Response
     * @throws ApiError
     */
    public static getVizconfigApiV2VisualizationsConfigConfigIdGet(
        configId: string,
    ): CancelablePromise<VisualizationConfigOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/visualizations/config/${configId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Vizconfig
     * @param configId
     * @returns VisualizationConfigOut Successful Response
     * @throws ApiError
     */
    public static deleteVizconfigApiV2VisualizationsConfigConfigIdDelete(
        configId: string,
    ): CancelablePromise<VisualizationConfigOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/visualizations/config/${configId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Vizconfig Map
     * @param configId
     * @param requestBody
     * @returns VisualizationConfigOut Successful Response
     * @throws ApiError
     */
    public static updateVizconfigMapApiV2VisualizationsConfigConfigIdVizdataPatch(
        configId: string,
        requestBody: any,
    ): CancelablePromise<VisualizationConfigOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/visualizations/config/${configId}/vizdata`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}