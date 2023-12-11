/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Body_get_dataset_metadata_api_v2_datasets__dataset_id__metadata_get } from '../models/Body_get_dataset_metadata_api_v2_datasets__dataset_id__metadata_get';
import type { Body_get_file_metadata_api_v2_files__file_id__metadata_get } from '../models/Body_get_file_metadata_api_v2_files__file_id__metadata_get';
import type { MetadataDefinitionIn } from '../models/MetadataDefinitionIn';
import type { MetadataDefinitionOut } from '../models/MetadataDefinitionOut';
import type { MetadataDelete } from '../models/MetadataDelete';
import type { MetadataIn } from '../models/MetadataIn';
import type { MetadataOut } from '../models/MetadataOut';
import type { MetadataPatch } from '../models/MetadataPatch';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class MetadataService {

    /**
     * Get Metadata Definition List
     * @param name
     * @param skip
     * @param limit
     * @returns MetadataDefinitionOut Successful Response
     * @throws ApiError
     */
    public static getMetadataDefinitionListApiV2MetadataDefinitionGet(
        name?: string,
        skip?: number,
        limit: number = 2,
    ): CancelablePromise<Array<MetadataDefinitionOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/metadata/definition`,
            query: {
                'name': name,
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Save Metadata Definition
     * @param requestBody
     * @returns MetadataDefinitionOut Successful Response
     * @throws ApiError
     */
    public static saveMetadataDefinitionApiV2MetadataDefinitionPost(
        requestBody: MetadataDefinitionIn,
    ): CancelablePromise<MetadataDefinitionOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/metadata/definition`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Get Metadata Definition
     * @param metadataDefinitionId
     * @returns MetadataDefinitionOut Successful Response
     * @throws ApiError
     */
    public static getMetadataDefinitionApiV2MetadataDefinitionMetadataDefinitionIdGet(
        metadataDefinitionId: string,
    ): CancelablePromise<MetadataDefinitionOut> {
        return __request({
            method: 'GET',
            path: `/api/v2/metadata/definition/${metadataDefinitionId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Metadata Definition
     * Delete metadata definition by specific ID.
     * @param metadataDefinitionId
     * @returns MetadataDefinitionOut Successful Response
     * @throws ApiError
     */
    public static deleteMetadataDefinitionApiV2MetadataDefinitionMetadataDefinitionIdDelete(
        metadataDefinitionId: string,
    ): CancelablePromise<MetadataDefinitionOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/metadata/definition/${metadataDefinitionId}`,
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Search Metadata Definition
     * Search all metadata definition in the db based on text.
     *
     * Arguments:
     * text -- any text matching name or description
     * skip -- number of initial records to skip (i.e. for pagination)
     * limit -- restrict number of records to be returned (i.e. for pagination)
     * @param searchTerm
     * @param skip
     * @param limit
     * @returns MetadataDefinitionOut Successful Response
     * @throws ApiError
     */
    public static searchMetadataDefinitionApiV2MetadataDefinitionSearchSearchTermGet(
        searchTerm: string,
        skip?: number,
        limit: number = 10,
    ): CancelablePromise<Array<MetadataDefinitionOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/metadata/definition/search/${searchTerm}`,
            query: {
                'skip': skip,
                'limit': limit,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Metadata
     * Delete metadata by specific ID.
     * @param metadataId
     * @param datasetId
     * @param xAdminMode
     * @returns any Successful Response
     * @throws ApiError
     */
    public static deleteMetadataApiV2MetadataMetadataIdDelete(
        metadataId: string,
        datasetId?: string,
        xAdminMode?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/metadata/${metadataId}`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
                'dataset_id': datasetId,
            },
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Metadata
     * Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
     * agent should be changed, use PUT.
     *
     * Returns:
     * Metadata document that was updated
     * @param metadataId
     * @param requestBody
     * @param datasetId
     * @param xAdminMode
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static updateMetadataApiV2MetadataMetadataIdPatch(
        metadataId: string,
        requestBody: MetadataPatch,
        datasetId?: string,
        xAdminMode?: string,
    ): CancelablePromise<MetadataOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/metadata/${metadataId}`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
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
     * Get File Metadata
     * Get file metadata.
     * @param fileId
     * @param version
     * @param allVersions
     * @param datasetId
     * @param xAdminMode
     * @param formData
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static getFileMetadataApiV2FilesFileIdMetadataGet(
        fileId: string,
        version?: number,
        allVersions: boolean = false,
        datasetId?: string,
        xAdminMode?: string,
        formData?: Body_get_file_metadata_api_v2_files__file_id__metadata_get,
    ): CancelablePromise<Array<MetadataOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/files/${fileId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
                'version': version,
                'all_versions': allVersions,
                'dataset_id': datasetId,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Replace File Metadata
     * Replace metadata, including agent and context. If only metadata contents should be updated, use PATCH instead.
     *
     * Returns:
     * Metadata document that was updated
     * @param fileId
     * @param requestBody
     * @param datasetId
     * @param xAdminMode
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static replaceFileMetadataApiV2FilesFileIdMetadataPut(
        fileId: string,
        requestBody: MetadataPatch,
        datasetId?: string,
        xAdminMode?: string,
    ): CancelablePromise<MetadataOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/files/${fileId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
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
     * Add File Metadata
     * Attach new metadata to a file. The body must include a contents field with the JSON metadata, and either a
     * context JSON-LD object, context_url, or definition (name of a metadata definition) to be valid.
     *
     * Returns:
     * Metadata document that was added to database
     * @param fileId
     * @param requestBody
     * @param datasetId
     * @param xAdminMode
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static addFileMetadataApiV2FilesFileIdMetadataPost(
        fileId: string,
        requestBody: MetadataIn,
        datasetId?: string,
        xAdminMode?: string,
    ): CancelablePromise<MetadataOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/files/${fileId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
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
     * Delete File Metadata
     * @param fileId
     * @param requestBody
     * @param datasetId
     * @param xAdminMode
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static deleteFileMetadataApiV2FilesFileIdMetadataDelete(
        fileId: string,
        requestBody: MetadataDelete,
        datasetId?: string,
        xAdminMode?: string,
    ): CancelablePromise<MetadataOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/files/${fileId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
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
     * Update File Metadata
     * Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
     * agent should be changed, use PUT.
     *
     * Returns:
     * Metadata document that was updated
     * @param fileId
     * @param requestBody
     * @param datasetId
     * @param xAdminMode
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static updateFileMetadataApiV2FilesFileIdMetadataPatch(
        fileId: string,
        requestBody: MetadataPatch,
        datasetId?: string,
        xAdminMode?: string,
    ): CancelablePromise<MetadataOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/files/${fileId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            query: {
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
     * Get Dataset Metadata
     * @param datasetId
     * @param xAdminMode
     * @param formData
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static getDatasetMetadataApiV2DatasetsDatasetIdMetadataGet(
        datasetId: string,
        xAdminMode?: string,
        formData?: Body_get_dataset_metadata_api_v2_datasets__dataset_id__metadata_get,
    ): CancelablePromise<Array<MetadataOut>> {
        return __request({
            method: 'GET',
            path: `/api/v2/datasets/${datasetId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            formData: formData,
            mediaType: 'application/x-www-form-urlencoded',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Replace Dataset Metadata
     * Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
     * agent should be changed, use PUT.
     *
     * Returns:
     * Metadata document that was updated
     * @param datasetId
     * @param requestBody
     * @param xAdminMode
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static replaceDatasetMetadataApiV2DatasetsDatasetIdMetadataPut(
        datasetId: string,
        requestBody: MetadataIn,
        xAdminMode?: string,
    ): CancelablePromise<MetadataOut> {
        return __request({
            method: 'PUT',
            path: `/api/v2/datasets/${datasetId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Add Dataset Metadata
     * Attach new metadata to a dataset. The body must include a contents field with the JSON metadata, and either a
     * context JSON-LD object, context_url, or definition (name of a metadata definition) to be valid.
     *
     * Returns:
     * Metadata document that was added to database
     * @param datasetId
     * @param requestBody
     * @param xAdminMode
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static addDatasetMetadataApiV2DatasetsDatasetIdMetadataPost(
        datasetId: string,
        requestBody: MetadataIn,
        xAdminMode?: string,
    ): CancelablePromise<MetadataOut> {
        return __request({
            method: 'POST',
            path: `/api/v2/datasets/${datasetId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Delete Dataset Metadata
     * @param datasetId
     * @param requestBody
     * @param xAdminMode
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static deleteDatasetMetadataApiV2DatasetsDatasetIdMetadataDelete(
        datasetId: string,
        requestBody: MetadataDelete,
        xAdminMode?: string,
    ): CancelablePromise<MetadataOut> {
        return __request({
            method: 'DELETE',
            path: `/api/v2/datasets/${datasetId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

    /**
     * Update Dataset Metadata
     * Update metadata. Any fields provided in the contents JSON will be added or updated in the metadata. If context or
     * agent should be changed, use PUT.
     *
     * Returns:
     * Metadata document that was updated
     * @param datasetId
     * @param requestBody
     * @param xAdminMode
     * @returns MetadataOut Successful Response
     * @throws ApiError
     */
    public static updateDatasetMetadataApiV2DatasetsDatasetIdMetadataPatch(
        datasetId: string,
        requestBody: MetadataPatch,
        xAdminMode?: string,
    ): CancelablePromise<MetadataOut> {
        return __request({
            method: 'PATCH',
            path: `/api/v2/datasets/${datasetId}/metadata`,
            headers: {
                'x_admin_mode': xAdminMode,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                422: `Validation Error`,
            },
        });
    }

}