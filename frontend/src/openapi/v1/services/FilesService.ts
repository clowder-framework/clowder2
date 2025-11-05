/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Comment } from '../models/Comment';
import type { File } from '../models/File';
import type { JSONLD } from '../models/JSONLD';
import type { License } from '../models/License';
import type { Tags } from '../models/Tags';
import type { UUID } from '../models/UUID';
import type { CancelablePromise } from '../core/CancelablePromise';
import { request as __request } from '../core/request';

export class FilesService {

    /**
     * List all files
     * Returns list of files and descriptions.
     * @returns File Successfully returns a list of files
     * @throws ApiError
     */
    public static getFiles(): CancelablePromise<Array<File>> {
        return __request({
            method: 'GET',
            path: `/files`,
            errors: {
                401: `Access to this resource is disabled
                 * `,
            },
        });
    }

    /**
     * Download file
     * Can use Chunked transfer encoding if the HTTP header RANGE is set.
     * This function will be reused to actually download the metadata of
     * the file, please use /files/{id}/blob to get the actual bytes.
     *
     * @param id ID of file object
     * @returns binary The requested data in binary form
     * @throws ApiError
     */
    public static getFiles1(
        id: string,
    ): CancelablePromise<Blob> {
        return __request({
            method: 'GET',
            path: `/files/${id}`,
            errors: {
                400: `The server could not process your request, this happens for example when
                 * the id specified is not of the correct form. See the message field for
                 * more information.
                 * `,
                401: `The request has not been applied because it lacks valid authentication
                 * credentials for the target resource.
                 * `,
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Delete file
     * Cascading action (removes file from any datasets containing it and
     * deletes its previews, metadata and thumbnail).
     *
     * @param id ID of file object
     * @returns any OK
     * @throws ApiError
     */
    public static deleteFiles(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/files/${id}`,
            errors: {
                400: `The server could not process your request, this happens for example when
                 * the id specified is not of the correct form. See the message field for
                 * more information.
                 * `,
                401: `The request has not been applied because it lacks valid authentication
                 * credentials for the target resource.
                 * `,
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Download file
     * Can use Chunked transfer encoding if the HTTP header RANGE is set.
     * @param id ID of file object
     * @returns binary The requested data in binary form
     * @throws ApiError
     */
    public static getFiles2(
        id: string,
    ): CancelablePromise<Blob> {
        return __request({
            method: 'GET',
            path: `/files/${id}/blob`,
            errors: {
                400: `The server could not process your request, this happens for example when
                 * the id specified is not of the correct form. See the message field for
                 * more information.
                 * `,
                401: `The request has not been applied because it lacks valid authentication
                 * credentials for the target resource.
                 * `,
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * @deprecated
     * Delete file
     * use DELETE /files/{id} instead
     * @param id ID of file object
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/remove`,
        });
    }

    /**
     * Deletes files
     * Deletes a list of files by fileIds
     * @returns UUID Returns Status Success
     * @throws ApiError
     */
    public static postFiles1(): CancelablePromise<Array<UUID>> {
        return __request({
            method: 'POST',
            path: `/files/bulkRemove`,
            errors: {
                401: `The request has not been applied because it lacks valid authentication
                 * credentials for the target resource.
                 * `,
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get file previews
     * Return the currently existing previews of the selected file (full
     * description, including paths to preview files, previewer names etc).
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles3(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/getPreviews`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Retrieve physical file object metadata
     * Get information of the file object (not the resource it describes) as JSON.
     * For example, size of file, date created, content type, filename.
     *
     * @param id
     * @returns File Successfully returns a list of files
     * @throws ApiError
     */
    public static getFiles4(
        id: string,
    ): CancelablePromise<File> {
        return __request({
            method: 'GET',
            path: `/files/${id}/metadata`,
            errors: {
                401: `Access to this resource is disabled
                 * `,
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Add technical metadata to file
     * Metadata in attached JSON object will describe the file's described
     * resource, not the file object itself.
     *
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles2(
        id: string,
        requestBody?: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/metadata`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get the sections of a file
     * Get the sections of a file.
     *
     * @param id
     * @returns UUID OK
     * @throws ApiError
     */
    public static getFiles5(
        id: string,
    ): CancelablePromise<Array<UUID>> {
        return __request({
            method: 'GET',
            path: `/files/${id}/sections`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get path to file in dataset
     * Return the path from the dataset down to the folder
     * containing this file id.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles6(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/paths`,
        });
    }

    /**
     * Submit this file to be archived
     * Submit this file to the queue to be archived.
     * This requires RabbitMQ and a compatible archival extractor to be running.
     * See https://github.com/clowder-framework/extractors-archival
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles3(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/sendArchiveRequest`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Changes a file's status to ARCHIVED
     * Callback that will change a file's status to ARCHIVED.
     * This is used by archival extractors and is not typically used by clients.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles4(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/archive`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Submit this file to be unarchived
     * Submit this file to the queue to be unarchived.
     * This requires RabbitMQ and a compatible archival extractor to be running.
     * See https://github.com/clowder-framework/extractors-archival
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles5(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/sendUnarchiveRequest`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Changes a file's status back to PROCESSED
     * Callback that will change a file's status back to PROCESSED.
     * This is used by archival extractors and is not typically used by clients.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles6(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/unarchive`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Submit file for extraction by a specific extractor
     * Extractions for Files.
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles7(
        id: string,
        requestBody: {
            parameters?: Array<string>;
            /**
             * the extractor Id
             */
            extractor?: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/extractions`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Cancel a submitted file extraction.
     * Extractions for file.
     * @param id
     * @param msgId
     * @returns any OK
     * @throws ApiError
     */
    public static deleteFiles1(
        id: string,
        msgId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/files/${id}/extractions/${msgId}`,
        });
    }

    /**
     * Upload a file to a specific dataset
     * Uploads the file, then links it with the dataset. Returns file id as
     * JSON object, or ids with filenames if multiple files are sent. ID can be
     * used to work on the file using the API. Uploaded file can be an XML
     * metadata file to be added to the dataset. If the optional Boolean
     * parameter extract is set to false, it does not send the file for
     * extraction. By default, Boolean parameter extract is set to true.
     *
     * @param id the dataset id
     * @param formData
     * @param showPreviews default as "DatasetLevel"
     * @param originalZipFile the UUID string of original zip file
     * @param flags flags for previews
     * @param extract
     * @param folderId
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles8(
        id: string,
        formData: any,
        showPreviews?: string,
        originalZipFile?: string,
        flags?: string,
        extract?: boolean,
        folderId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/uploadToDataset/${id}`,
            query: {
                'showPreviews': showPreviews,
                'originalZipFile': originalZipFile,
                'flags': flags,
                'extract': extract,
                'folder_id': folderId,
            },
            formData: formData,
            mediaType: 'multipart/form-data',
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Unfollow file
     * Remove user from file followers and remove file from user followed
     * files.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles9(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/unfollow`,
        });
    }

    /**
     * List file previews
     * Return the currently existing previews' basic characteristics (id,
     * filename, content type) of the selected file.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles7(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/listpreviews`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Upload file
     * Upload the attached file using multipart form enconding. Returns file id
     * as JSON object, or ids with filenames if multiple files are sent. ID can
     * be used to work on the file using the API. Uploaded file can be an XML
     * metadata file.
     *
     * @param flags
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles10(
        flags: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/withFlags/${flags}`,
        });
    }

    /**
     * Add user-generated metadata to file
     * Metadata in attached JSON object will describe the file's described
     * resource, not the file object itself.
     *
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles11(
        id: string,
        requestBody: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/usermetadata`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get URLs of file's RDF metadata exports.
     * URLs of metadata files exported from XML (if the file was an XML
     * metadata file) as well as the URL used to export the file's
     * user-generated metadata as RDF.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles8(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/getRDFURLsForFile/${id}`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Upload a preview
     * Upload a preview
     * @param formData
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles12(
        formData?: any,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/previews`,
            formData: formData,
            mediaType: 'multipart/form-data',
        });
    }

    /**
     * Attach existing preview to file
     * A file is the raw bytes plus metadata.
     * @param id
     * @param pId
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles13(
        id: string,
        pId: string,
        requestBody?: {
            extractor_id?: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/previews/${pId}`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Is being processed
     * Return whether a file is currently being processed by a preprocessor.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles9(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/isBeingProcessed`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Reindex a file
     * Reindex the existing file.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles14(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/reindex`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Update a file name
     * Takes one argument, a UUID of the file. Request body takes a key-value
     * pair for the name
     *
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putFiles(
        id: string,
        requestBody: {
            name?: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'PUT',
            path: `/files/${id}/filename`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Update technical metadata of a file generated by a specific extractor
     * Metadata in attached JSON object will describe the file's described
     * resource, not the file object itself. The method will search the entire
     * techincal metadata array for the metadata generated by a specific
     * extractor (using extractor_id provided as an argument) and if a match is
     * found, it will update the corresponding metadata element.
     *
     * @param id
     * @param requestBody json body that can be parsed as DBObject
     * @param extractorId
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles15(
        id: string,
        requestBody: any,
        extractorId?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/updateMetadata`,
            query: {
                'extractor_id': extractorId,
            },
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Follow file
     * Add user to file followers and add file to user followed files.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles16(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/follow`,
        });
    }

    /**
     * Retrieve metadata as JSON-LD
     * Get metadata of the file object as JSON-LD.
     * @param id
     * @param extractor
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles10(
        id: string,
        extractor?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/metadata.jsonld`,
            query: {
                'extractor': extractor,
            },
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Add JSON-LD metadata to the database.
     * Metadata in attached JSON-LD object will be added to metadata Mongo db
     * collection.
     *
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles17(
        id: string,
        requestBody: JSONLD,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/metadata.jsonld`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Remove JSON-LD metadata, filtered by extractor if necessary
     * Remove JSON-LD metadata from file object
     * @param id
     * @param extractor
     * @returns any OK
     * @throws ApiError
     */
    public static deleteFiles2(
        id: string,
        extractor?: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/files/${id}/metadata.jsonld`,
            query: {
                'extractor': extractor,
            },
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Retrieve metadata as JSON-LD for multiple files at once
     * Use ?id=123&id=456&... to retrieve metadata for multiple files at once.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles11(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/metadata.jsonld`,
            query: {
                'id': id,
            },
        });
    }

    /**
     * Add JSON-LD metadata to multiple files at once.
     * JSON object in post should have a list of file IDs under "files" key and metadata under "metadata" key.
     * Metadata will be added to each file in metadata Mongo db collection.
     *
     * @param requestBody the metadata to add and the file IDs to add it to
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles18(
        requestBody?: {
            files: Array<string>;
            metadata: any;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/metadata.jsonld`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Gets tags of a file
     * Returns a list of strings, List[String].
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles12(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/tags`,
        });
    }

    /**
     * Adds tags to a file
     * Tag's (name, userId, extractor_id) tuple is used as a unique key. In
     * other words, the same tag names but diff userId or extractor_id are
     * considered as diff tags, so will be added.  The tags are expected as a
     * list of strings: List[String].  An example is:<br>    curl -H
     * 'Content-Type: application/json' -d '{"tags":["namo", "amitabha"],
     * "extractor_id": "curl"}'
     * "http://localhost:9000/api/files/533c2389e4b02a14f0943356/tags?key=theKey"
     *
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles19(
        id: string,
        requestBody: Tags,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/tags`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Removes tags of a file
     * Tag's (name, userId, extractor_id) tuple is unique key. Same tag names
     * but diff userId or extractor_id are considered diff tags. Tags can only
     * be removed by the same user or extractor.  The tags are expected as a
     * list of strings: List[String].
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static deleteFiles3(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/files/${id}/tags`,
        });
    }

    /**
     * Update License information of a file
     * Takes four arguments, all Strings. licenseType, rightsHolder,
     * licenseText, licenseUrl
     *
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles20(
        id: string,
        requestBody: License,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/license`,
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Get Versus metadata of the resource described by the file
     * A file is the raw bytes plus metadata.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles13(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/versus_metadata`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Update file description
     * Takes one argument, a UUID of the file. Request body takes key-value
     * pair for the description
     *
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static putFiles1(
        id: string,
        requestBody: {
            description: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'PUT',
            path: `/files/${id}/updateDescription`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get technical metadata of the resource described by the file
     * A file is the raw bytes plus metadata.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles14(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/technicalmetadatajson`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * (Re)send preprocessing job for file
     * Force Clowder to (re)send preprocessing job for selected file,
     * processing the file as a file of the selected MIME type. Returns file id
     * on success. In the requested file type, replace / with __ (two
     * underscores).
     *
     * @param fileId
     * @param fileType
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles21(
        fileId: string,
        fileType: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/sendJob/${fileId}/${fileType}`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get metadata of the resource described by the file that were input as
     * XML
     *
     * A file is the raw bytes plus metadata.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles15(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/xmlmetadatajson`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Provides metadata extracted for a file
     * A file is the raw bytes plus metadata.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles16(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/extracted_metadata`,
        });
    }

    /**
     * Add comment to file
     * A file is the raw bytes plus metadata.
     * @param id
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles22(
        id: string,
        requestBody: Comment,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/comment`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * @deprecated
     * Removes a tag from a file
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles23(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/tags/remove`,
        });
    }

    /**
     * Removes all tags of a file
     * This is a big hammer -- it does not check the userId or extractor_id and
     * forcefully remove all tags for this file.  It is mainly intended for
     * testing.
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles24(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/tags/remove_all`,
        });
    }

    /**
     * Upload a thumbnail
     * Upload a thumbnail.
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles25(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/fileThumbnail`,
            errors: {
                400: `The server could not process your request, this happens for example when
                 * the id specified is not of the correct form. See the message field for
                 * more information.
                 * `,
            },
        });
    }

    /**
     * Download a thumbnail
     * Download a thumbnail.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles26(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/fileThumbnail/${id}/blob`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Add thumbnail to file
     * Attaches an already-existing thumbnail to a file.
     * @param id
     * @param thumbnailId
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles27(
        id: string,
        thumbnailId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/files/${id}/thumbnails/${thumbnailId}`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get metadata definitions available for a file
     * The metadata definitions come from the spaces that the dataset the file
     * is part of. Directly or within a folder
     *
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles17(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/metadataDefinitions`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get the user-generated metadata of the selected file in an RDF file
     * A file is the raw bytes plus metadata.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles18(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/rdfUserMetadata/${id}`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get community-generated metadata of the resource described by the file
     * A file is the raw bytes plus metadata.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles19(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/files/${id}/usermetadatajson`,
        });
    }

    /**
     * Fetches and downloads a particular query
     * Fetches and downloads a particular query.
     * @param id
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles20(
        id: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/queries/${id}`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Add thumbnail to a query image
     * Attaches an already-existing thumbnail to a query image.
     * @param fileId
     * @param thumbnailId
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles28(
        fileId: string,
        thumbnailId: string,
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/queries/${fileId}/thumbnails/${thumbnailId}`,
            errors: {
                404: `The requested resource was not found`,
            },
        });
    }

    /**
     * Get the list of user-selected files
     * Get the list of user-selected files.
     *
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles21(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/selected`,
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * Select a specific file
     * Select a specific file.
     *
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles29(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/selected`,
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * De-select a specific file
     * De-select a specific file.
     *
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles30(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/selected/remove`,
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * Download all selected files
     * Download all selected files.
     *
     * @returns any OK
     * @throws ApiError
     */
    public static getFiles22(): CancelablePromise<any> {
        return __request({
            method: 'GET',
            path: `/selected/files`,
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * Delete all selected files
     * Delete all selected files.
     *
     * @returns any OK
     * @throws ApiError
     */
    public static deleteFiles4(): CancelablePromise<any> {
        return __request({
            method: 'DELETE',
            path: `/selected/files`,
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * De-select all files
     * De-select all files.
     *
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles31(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/selected/clear`,
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * Apply a tag to all selected files
     * Apply a tag to all selected files.
     *
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles32(): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/selected/tag`,
            errors: {
                401: `Not authorized`,
            },
        });
    }

    /**
     * Submit all selected files for extraction
     * Submit all selected files for extraction.
     *
     * @param dsId
     * @param fileIds
     * @param requestBody
     * @returns any OK
     * @throws ApiError
     */
    public static postFiles33(
        dsId: string,
        fileIds: string,
        requestBody: {
            parameters?: Array<string>;
            /**
             * the extractor Id
             */
            extractor?: string;
        },
    ): CancelablePromise<any> {
        return __request({
            method: 'POST',
            path: `/selected/submit/${dsId}/${fileIds}`,
            body: requestBody,
            mediaType: 'application/json',
            errors: {
                401: `Not authorized`,
            },
        });
    }

}