/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_add_Visualization_api_v2_public_visualizations_post } from '../models/Body_add_Visualization_api_v2_public_visualizations_post';
import type { VisualizationConfigIn } from '../models/VisualizationConfigIn';
import type { VisualizationConfigOut } from '../models/VisualizationConfigOut';
import type { VisualizationDataOut } from '../models/VisualizationDataOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicVisualizationsService {

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
     * @param config
     * @param formData
     * @returns VisualizationDataOut Successful Response
     * @throws ApiError
     */
    public static addVisualizationApiV2PublicVisualizationsPost(
        name: string,
        description: string,
        config: string,
        formData: Body_add_Visualization_api_v2_public_visualizations_post,
    ): CancelablePromise<VisualizationDataOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/public_visualizations`,
            query: {
                'name': name,
                'description': description,
                'config': config,
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
    public static getVisualizationApiV2PublicVisualizationsVisualizationIdGet(
        visualizationId: string,
    ): CancelablePromise<VisualizationDataOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_visualizations/${visualizationId}`,
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
    public static removeVisualizationApiV2PublicVisualizationsVisualizationIdDelete(
        visualizationId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/public_visualizations/${visualizationId}`,
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
    public static downloadVisualizationApiV2PublicVisualizationsVisualizationIdBytesGet(
        visualizationId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_visualizations/${visualizationId}/bytes`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Download Visualization Url
     * @param visualizationId
     * @param expiresInSeconds
     * @returns any Successful Response
     * @throws ApiError
     */
    public static downloadVisualizationUrlApiV2PublicVisualizationsVisualizationIdUrlGet(
        visualizationId: string,
        expiresInSeconds: number = 3600,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_visualizations/${visualizationId}/url/`,
            query: {
                'expires_in_seconds': expiresInSeconds,
            },
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
    public static saveVisualizationConfigApiV2PublicVisualizationsConfigPost(
        requestBody: VisualizationConfigIn,
    ): CancelablePromise<VisualizationConfigOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/public_visualizations/config`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Resource Visconfig
     * @param resourceId
     * @returns VisualizationConfigOut Successful Response
     * @throws ApiError
     */
    public static getResourceVisconfigApiV2PublicVisualizationsResourceIdConfigGet(
        resourceId: string,
    ): CancelablePromise<Array<VisualizationConfigOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_visualizations/${resourceId}/config`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Visconfig
     * @param configId
     * @returns VisualizationConfigOut Successful Response
     * @throws ApiError
     */
    public static getVisconfigApiV2PublicVisualizationsConfigConfigIdGet(
        configId: string,
    ): CancelablePromise<VisualizationConfigOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_visualizations/config/${configId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Visconfig
     * @param configId
     * @returns VisualizationConfigOut Successful Response
     * @throws ApiError
     */
    public static deleteVisconfigApiV2PublicVisualizationsConfigConfigIdDelete(
        configId: string,
    ): CancelablePromise<VisualizationConfigOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/public_visualizations/config/${configId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Visdata From Visconfig
     * @param configId
     * @returns VisualizationDataOut Successful Response
     * @throws ApiError
     */
    public static getVisdataFromVisconfigApiV2PublicVisualizationsConfigConfigIdVisdataGet(
        configId: string,
    ): CancelablePromise<Array<VisualizationDataOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/public_visualizations/config/${configId}/visdata`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

}