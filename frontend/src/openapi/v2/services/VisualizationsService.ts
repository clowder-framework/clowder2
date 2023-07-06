/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_add_Visualization_api_v2_visualizations_post } from '../models/Body_add_Visualization_api_v2_visualizations_post';
import type { VisualizationConfigIn } from '../models/VisualizationConfigIn';
import type { VisualizationConfigOut } from '../models/VisualizationConfigOut';
import type { VisualizationDataOut } from '../models/VisualizationDataOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class VisualizationsService {

    /**
     * Add Visualization
     * Insert VisualizationsDataDB object into MongoDB (makes Clowder ID), then Minio.
     *
     * Arguments:
     * name: name of visualization data
     * description: description of visualization data
     * file: bytes to upload
     * @param name
     * @param description
     * @param formData
     * @returns VisualizationDataOut Successful Response
     * @throws ApiError
     */
    public static addVisualizationApiV2VisualizationsPost(
        name: string,
        description: string,
        formData: Body_add_Visualization_api_v2_visualizations_post,
    ): CancelablePromise<VisualizationDataOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/visualizations`,
            query: {
                'name': name,
                'description': description,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Visualization
     * @param visualizationId
     * @returns VisualizationDataOut Successful Response
     * @throws ApiError
     */
    public static getVisualizationApiV2VisualizationsVisualizationIdGet(
        visualizationId: string,
    ): CancelablePromise<VisualizationDataOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/visualizations/${visualizationId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Remove Visualization
     * @param visualizationId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static removeVisualizationApiV2VisualizationsVisualizationIdDelete(
        visualizationId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/visualizations/${visualizationId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download Visualization
     * @param visualizationId
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadVisualizationApiV2VisualizationsDownloadVisualizationIdGet(
        visualizationId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/visualizations/download/${visualizationId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

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