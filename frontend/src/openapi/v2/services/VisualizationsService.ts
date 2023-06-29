/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_add_Visualization_api_v2_visualizations_post } from '../models/Body_add_Visualization_api_v2_visualizations_post';
import type { VisualizationOut } from '../models/VisualizationOut';
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
     * @returns VisualizationOut Successful Response
     * @throws ApiError
     */
    public static addVisualizationApiV2VisualizationsPost(
        name: string,
        description: string,
        formData: Body_add_Visualization_api_v2_visualizations_post,
    ): CancelablePromise<VisualizationOut> {
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
     * @returns VisualizationOut Successful Response
     * @throws ApiError
     */
    public static getVisualizationApiV2VisualizationsVisualizationIdGet(
        visualizationId: string,
    ): CancelablePromise<VisualizationOut> {
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

}