/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class CurationsService {

    /**
     * Update the user repository preferences and call the matchmaker
     * A curation object is a request for publication that captures the state
     * of a dataset ready for publication
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postCurations(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/spaces/curations/${id}/matchmaker`,
        });
    }

    /**
     * Retract the publication request
     * A curation object is a request for publication that captures the state
     * of a dataset ready for publication
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteCurations(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/spaces/curations/retract/${id}`,
        });
    }

    /**
     * Delete a folder from a publication request
     * A curation object is a request for publication that captures the state
     * of a dataset ready for publication
     *
     * @param id
     * @param curationFolderId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteCurations1(
        id: string,
        curationFolderId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/spaces/curations/${id}/folders/${curationFolderId}`,
        });
    }

    /**
     * Get files in publication request
     * A curation object is a request for publication that captures the state
     * of a dataset ready for publication
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getCurations(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/spaces/curations/${id}/curationFile`,
        });
    }

    /**
     * Delete a file from a publication request
     * A curation object is a request for publication that captures the state
     * of a dataset ready for publication
     *
     * @param id
     * @param curationFileId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteCurations2(
        id: string,
        curationFileId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/spaces/curations/${id}/files/${curationFileId}`,
        });
    }

    /**
     * Get the ORE map for the proposed publication
     * A curation object is a request for publication that captures the state
     * of a dataset ready for publication
     *
     * @param curationId
     * @returns any OK
     * @throws ApiError
     */
    public static getCurations1(
        curationId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/curations/${curationId}/ore`,
        });
    }

}