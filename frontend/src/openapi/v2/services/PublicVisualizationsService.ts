/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { VisualizationConfigOut } from '../models/VisualizationConfigOut';
import type { VisualizationDataOut } from '../models/VisualizationDataOut';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class PublicVisualizationsService {

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