/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Comment } from "../models/Comment";
import type { Dataset } from "../models/Dataset";
import type { JSONLD } from "../models/JSONLD";
import type { License } from "../models/License";
import type { Tags } from "../models/Tags";
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";

export class DatasetsService {
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
	public static postDatasets(
		id: string,
		formData: any,
		showPreviews?: string,
		originalZipFile?: string,
		flags?: string,
		extract?: boolean,
		folderId?: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/uploadToDataset/${id}`,
			query: {
				showPreviews: showPreviews,
				originalZipFile: originalZipFile,
				flags: flags,
				extract: extract,
				folder_id: folderId,
			},
			formData: formData,
			mediaType: "multipart/form-data",
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * List all datasets the user can view
	 * This will check for Permission.ViewDataset
	 * @param when
	 * @param date
	 * @param title
	 * @param limit The number of collections returns, default as 12.
	 * @param exact
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets(
		when?: string,
		date?: string,
		title?: string,
		limit?: number,
		exact?: boolean
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets`,
			query: {
				when: when,
				date: date,
				title: title,
				limit: limit,
				exact: exact,
			},
		});
	}

	/**
	 * Create new dataset
	 * New dataset containing one existing file, based on values of fields in
	 * attached JSON. Returns dataset id as JSON object.
	 *
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets1(requestBody: {
		name: string;
		description?: string;
		space?: string;
		file_id: string;
	}): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Get a specific dataset
	 * This will return a specific dataset requested
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets1(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Delete dataset
	 * Cascading action (deletes all previews and metadata of the dataset and
	 * all files existing only in the deleted dataset).
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteDatasets(id: string): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/datasets/${id}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Copy the dataset, as well as the folders and files within the dataset
	 * into a space, return the new dataset id
	 *
	 * Check AddResourceToSpace permission.
	 * @param dsId
	 * @param spaceId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets2(
		dsId: string,
		spaceId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${dsId}/copyDatasetToSpace/${spaceId}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Attach existing file to dataset
	 * If the file is an XML metadata file, the metadata are added to the
	 * dataset.
	 *
	 * @param dsId
	 * @param fileId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets3(
		dsId: string,
		fileId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${dsId}/files/${fileId}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Move existing file to a new folder within the same dataset
	 * @param dsId
	 * @param folderId destination folder id
	 * @param fileId
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets4(
		dsId: string,
		folderId: string,
		fileId: string,
		requestBody: {
			/**
			 * old folder id
			 */
			folderId?: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${dsId}/moveFile/${folderId}/${fileId}`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Move existing file from the old folder to a new dataset
	 * @param dsId
	 * @param folderId old folder id
	 * @param fileId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets5(
		dsId: string,
		folderId: string,
		fileId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${dsId}/moveToDataset/${folderId}/${fileId}`,
		});
	}

	/**
	 * Detach existing file from a dataset
	 * Check CreateDataset permission
	 * @param dsId
	 * @param fileId
	 * @param ignoreNotFound
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets6(
		dsId: string,
		fileId: string,
		ignoreNotFound: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${dsId}/filesRemove/${fileId}/${ignoreNotFound}`,
		});
	}

	/**
	 * list all folders in the dataset
	 * @param dsId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets2(dsId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${dsId}/folders`,
		});
	}

	/**
	 * Remove all tags of dataset
	 * Forcefully remove all tags for this dataset.  It is mainly intended for
	 * testing.
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets7(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/tags/remove_all`,
		});
	}

	/**
	 * Get the tags associated with this dataset
	 * Returns a JSON object of multiple fields
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets3(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/tags`,
		});
	}

	/**
	 * Add tags to dataset
	 * Requires that the request body contains a 'tags' field of List[String]
	 * type.
	 *
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets8(
		id: string,
		requestBody: Tags
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/tags`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Remove tags of dataset
	 * Requires that the request body contains a 'tags' field of List[String]
	 * type.
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteDatasets1(id: string): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/datasets/${id}/tags`,
		});
	}

	/**
	 * Insert add_file Event
	 * Insert an Event into the Events Collection
	 * @param id
	 * @param inFolder if the file is add directly to the dataset or add to a folder
	 * @param fileCount
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets9(
		id: string,
		inFolder: boolean,
		fileCount: number
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/addFileEvent`,
			query: {
				inFolder: inFolder,
				fileCount: fileCount,
			},
		});
	}

	/**
	 * Is being processed
	 * Return whether a dataset is currently being processed by a preprocessor.
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets4(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/isBeingProcessed`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Create new dataset with no file
	 * New dataset requiring zero files based on values of fields in attached
	 * JSON. Returns dataset id as JSON object. Requires name, description, and
	 * space. Optional list of existing file ids to add.
	 *
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets10(requestBody: Dataset): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/createempty`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Update dataset description.
	 * Takes one argument, a UUID of the dataset. Request body takes key-value
	 * pair for description.
	 *
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putDatasets(
		id: string,
		requestBody: {
			description: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "PUT",
			path: `/datasets/${id}/description`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Add user-generated metadata to dataset
	 * A dataset is a container for files and metadata
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets11(
		id: string,
		requestBody?: any
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/usermetadata`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * List extractors generated metadata of a dataset
	 * A dataset is a container for files and metadata
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets5(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/technicalmetadatajson`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Get community-generated metadata of the resource described by the dataset
	 * A dataset is a container for files and metadata
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets6(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/usermetadatajson`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Get metadata of the resource described by the dataset that were input as
	 * XML
	 *
	 * A dataset is a container for files and metadata
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets7(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/xmlmetadatajson`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Detach file from dataset
	 * File is not deleted, only separated from the selected dataset. If the
	 * file is an XML metadata file, the metadata are removed from the dataset.
	 *
	 * @param dsId
	 * @param fileId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteDatasets2(
		dsId: string,
		fileId: string
	): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/datasets/${dsId}/${fileId}`,
		});
	}

	/**
	 * Add comment to dataset
	 * A dataset is a container for files and metadata
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets12(
		id: string,
		requestBody: Comment
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/comment`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * List all users in the spaces that contain this dataset in json-ld format
	 * A dataset is a container for files and metadata
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets8(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/user`,
		});
	}

	/**
	 * Retrieve available metadata definitions for a dataset. It is an
	 * aggregation of the metadata that a space belongs to.
	 *
	 * A dataset is a container for files and metadata
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets9(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/metadata`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Add metadata to dataset
	 * The extractor is set as "http://clowder.ncsa.illinois.edu/extractors/deprecatedapi",
	 * contextURL and contextID as None.
	 * Returns success or failure.
	 *
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets13(
		id: string,
		requestBody: any
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/metadata`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Get URLs of dataset's RDF metadata exports
	 * URLs of metadata exported as RDF from XML files contained in the
	 * dataset, as well as the URL used to export the dataset's user-generated
	 * metadata as RDF.
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets10(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/getRDFURLsForDataset/${id}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Get the user-generated metadata of the selected dataset in an RDF file
	 * A dataset is a container for files and metadata
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets11(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/rdfUserMetadata/${id}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Unfollow dataset.
	 * Remove user from dataset followers and remove dataset from user followed
	 * datasets.
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets14(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/unfollow`,
		});
	}

	/**
	 * Add a creator to the Dataset's list of Creators.
	 * Takes one argument, a UUID of the dataset. Request body takes key-value
	 * pair for creator.
	 *
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets15(
		id: string,
		requestBody: {
			creator?: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/creator`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Remove a creator from the Dataset's list of Creators.
	 * Takes the UUID of the dataset and the entry to delete (a String).
	 * @param id
	 * @param creator
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteDatasets3(
		id: string,
		creator: string
	): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/datasets/${id}/creator/remove`,
			query: {
				creator: creator,
			},
		});
	}

	/**
	 * Move a creator in a Dataset's list of creators.
	 * Takes the UUID of the dataset, the creator to move (a String) and the
	 * new position of the creator in the overall list of creators.
	 *
	 * @param id
	 * @param creator
	 * @param newPos
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putDatasets1(
		id: string,
		creator: string,
		newPos: number
	): CancelablePromise<any> {
		return __request({
			method: "PUT",
			path: `/datasets/${id}/creator/reorder`,
			query: {
				creator: creator,
				newPos: newPos,
			},
		});
	}

	/**
	 * Detach and delete dataset
	 * Detaches all files before proceeding to perform the stanadard delete on
	 * the dataset.
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets16(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/detachdelete`,
		});
	}

	/**
	 * change the access of dataset
	 * Downloads all files contained in a dataset.
	 * @param id
	 * @param access default as PRIVATE
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putDatasets2(
		id: string,
		access?: string
	): CancelablePromise<any> {
		return __request({
			method: "PUT",
			path: `/datasets/${id}/access`,
			query: {
				access: access,
			},
		});
	}

	/**
	 * List all datasets the user can edit
	 * This will check for Permission.AddResourceToDataset and
	 * Permission.EditDataset
	 *
	 * @param when
	 * @param date
	 * @param title
	 * @param limit The number of collections returns, default as 12.
	 * @param exact
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets12(
		when?: string,
		date?: string,
		title?: string,
		limit?: number,
		exact?: boolean
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/canEdit`,
			query: {
				when: when,
				date: date,
				title: title,
				limit: limit,
				exact: exact,
			},
		});
	}

	/**
	 * Update dataset name
	 * Takes one argument, a UUID of the dataset. Request body takes key-value
	 * pair for name.
	 *
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putDatasets3(
		id: string,
		requestBody: {
			name: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "PUT",
			path: `/datasets/${id}/title`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Queue up all files in a dataset to be marked as ARCHIVED
	 * Queue up all files in a dataset to be marked as ARCHIVED
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets17(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/queueArchival`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Queue up all files in a dataset to be marked as PROCESSED
	 * Queue up all files in a dataset to be marked as PROCESSED
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets18(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/queueUnarchival`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * @deprecated
	 * List all datasets in a collection
	 * Returns list of datasets and descriptions.
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets13(collId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${collId}/getDatasets`,
		});
	}

	/**
	 * List all datasets outside a collection
	 * Returns list of datasets and descriptions.
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets14(collId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/listOutsideCollection/${collId}`,
		});
	}

	/**
	 * Update dataset administrative information
	 * Takes one argument, a UUID of the dataset. Request body takes key-value
	 * pairs for name and description.
	 *
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets19(
		id: string,
		requestBody: {
			name: string;
			description: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/editing`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Get dataset previews
	 * Return the currently existing previews of the selected dataset (full
	 * description, including paths to preview files, previewer names etc).
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets15(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/getPreviews`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * List datasets satisfying a general metadata search tree
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets20(requestBody: any): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/searchmetadata`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * List datasets satisfying a user metadata search tree
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets21(requestBody: any): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/searchusermetadata`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Retrieve metadata as JSON-LD
	 * Get metadata of the dataset object as JSON-LD.
	 * @param id
	 * @param extractor
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets16(
		id: string,
		extractor?: string
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/metadata.jsonld`,
			query: {
				extractor: extractor,
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
	public static postDatasets22(
		id: string,
		requestBody: JSONLD
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/metadata.jsonld`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Remove JSON-LD metadata, filtered by extractor if necessary
	 * Remove JSON-LD metadata from dataset object
	 * @param id
	 * @param extractor
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteDatasets4(
		id: string,
		extractor?: string
	): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/datasets/${id}/metadata.jsonld`,
			query: {
				extractor: extractor,
			},
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Update license information of a dataset
	 * Takes four arguments, all Strings. licenseType, rightsHolder,
	 * licenseText, licenseUrl
	 *
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets23(
		id: string,
		requestBody: License
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/license`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Follow dataset
	 * Add user to dataset followers and add dataset to user followed datasets.
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets24(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/follow`,
		});
	}

	/**
	 * Attach multiple files to an existing dataset
	 * Add multiple files, by ID, to a dataset that is already in the system.
	 * Requires file ids and dataset id.
	 *
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets25(requestBody: {
		datasetid: string;
		/**
		 * file ids seperated by comma
		 */
		existingfiles: string;
	}): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/attachmultiple`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Reindex a dataset
	 * Reindex the existing dataset, if recursive is set to true if will also
	 * reindex all files in that dataset.
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets26(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/reindex`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * List files in dataset, including those within folders
	 * Datasets and descriptions.
	 * @param id
	 * @param max
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets17(
		id: string,
		max?: number
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/files`,
			query: {
				max: max,
			},
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Upload files and attach to given dataset
	 * This will take a list of url or path objects that point to files that
	 * will be ingested and added to this dataset.
	 *
	 * @param id
	 * @param formData
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets27(
		id: string,
		formData: any
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/files`,
			formData: formData,
			mediaType: "multipart/form-data",
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Upload files and attach to given dataset
	 * This will take an URL of file object that are added to this dataset,
	 * the file source will be added as metadata. Request body takes key-value
	 * pairs for file url, the key can be fileurl, weburl or url.
	 * This can also add metadata at the same time.
	 *
	 * @param id
	 * @param requestBody the key can be fileurl, weburl or url
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets28(
		id: string,
		requestBody?: any
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/urls`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * List all datasets in the space the user can edit and thus move the file
	 * to
	 *
	 * This will check for Permission.AddResourceToDataset and
	 * Permission.EditDataset
	 *
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets18(): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/moveFileToDataset`,
		});
	}

	/**
	 * List files in dataset not in any folders
	 * Datasets and descriptions.
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets19(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/listFiles`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * List all file within a dataset
	 * @param dsId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets20(dsId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${dsId}/listAllFiles`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Remove tag of dataset
	 * A dataset is a container for files and metadata
	 * @param id
	 * @param requestBody The body of the POST request.
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets29(
		id: string,
		requestBody: {
			tagId: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/removeTag`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Attach existing file to a new dataset and delete it from the old one
	 * If the file is an XML metadata file, the metadata are added to the
	 * dataset.
	 *
	 * @param datasetId
	 * @param toDataset
	 * @param fileId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets30(
		datasetId: string,
		toDataset: string,
		fileId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${datasetId}/moveBetweenDatasets/${toDataset}/${fileId}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Download dataset
	 * Downloads all files contained in a dataset.
	 * @param id
	 * @param compression default as -1
	 * @param tracking default as true
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets21(
		id: string,
		compression?: number,
		tracking?: boolean
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/download`,
			query: {
				compression: compression,
				tracking: tracking,
			},
		});
	}

	/**
	 * Download a subset of files from a dataset
	 * Takes dataset ID and a JSON-string representing a list of file IDs
	 * @param id
	 * @param fileList ID of the files to download from the dataset
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets22(
		id: string,
		fileList: string
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/downloadPartial`,
			query: {
				fileList: fileList,
			},
		});
	}

	/**
	 * Download a folder from a dataset
	 * Takes dataset ID and a folder ID in that dataset and streams just that folder and sub-folders as a zip
	 * @param id
	 * @param folderId ID of the folder to download
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets23(
		id: string,
		folderId: string
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/${id}/downloadFolder`,
			query: {
				folderId: folderId,
			},
		});
	}

	/**
	 * Deleted all datasets in trash older than days specified
	 * Server admin action.
	 * @param days
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteDatasets5(days?: number): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/datasets/clearOldDatasetsTrash`,
			query: {
				days: days,
			},
		});
	}

	/**
	 * Emptying trash datasets
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteDatasets6(): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/datasets/emptyTrash`,
		});
	}

	/**
	 * list trash datasets
	 * @param limit
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getDatasets24(limit?: number): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/datasets/listTrash`,
			query: {
				limit: limit,
			},
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * restore a trash dataset
	 * This will check for Permission.DeleteDataset
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putDatasets4(id: string): CancelablePromise<any> {
		return __request({
			method: "PUT",
			path: `/datasets/restore/${id}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * @deprecated
	 * remove a tag from a dataset
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postDatasets31(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/datasets/${id}/tags/remove`,
		});
	}
}
