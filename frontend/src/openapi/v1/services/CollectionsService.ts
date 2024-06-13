/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Collection } from "../models/Collection";
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";

export class CollectionsService {
	/**
	 * Return a list of collections that fit the query standard and user has view permission
	 * Collections are groupings of datasets
	 * @param when
	 * @param title The title/ name of colletions
	 * @param date The date collection is created
	 * @param limit The number of collections returns, default as 12.
	 * @param exact
	 * @returns void
	 * @throws ApiError
	 */
	public static getCollections(
		when?: string,
		title?: string,
		date?: string,
		limit?: number,
		exact?: boolean
	): CancelablePromise<void> {
		return __request({
			method: "GET",
			path: `/collections`,
			query: {
				when: when,
				title: title,
				date: date,
				limit: limit,
				exact: exact,
			},
			errors: {
				401: `Not authorized`,
			},
		});
	}

	/**
	 * Create a collection
	 * Collections are groupings of datasets
	 * @param requestBody The body of the POST request to create a collection.
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections(
		requestBody?: Collection
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Get a specific collection
	 * Get a specific collection
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections1(collId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${collId}`,
		});
	}

	/**
	 * Remove collection
	 * Does not delete the individual datasets in the collection.
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteCollections(collId: string): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/collections/${collId}`,
		});
	}

	/**
	 * Get parent collections for collection
	 * Collections are groupings of datasets
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections2(collId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${collId}/getParentCollections`,
		});
	}

	/**
	 * Get all collections
	 * Collections are groupings of datasets
	 * @param limit
	 * @param showAll
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections3(
		limit?: number,
		showAll?: boolean
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/allCollections`,
			query: {
				limit: limit,
				showAll: showAll,
			},
		});
	}

	/**
	 * Update a collection name
	 * Takes one argument, a UUID of the collection. Request body takes a
	 * key-value pair for the name
	 *
	 * @param collId
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putCollections(
		collId: string,
		requestBody: {
			name: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "PUT",
			path: `/collections/${collId}/title`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * List all collections the user can edit except itself and its parent
	 * collections
	 *
	 * This will check for Permission.AddResourceToCollection and
	 * Permission.EditCollection
	 *
	 * @param currentCollectionId
	 * @param when
	 * @param title
	 * @param date
	 * @param limit
	 * @param exact
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections4(
		currentCollectionId: string,
		when?: string,
		title?: string,
		date?: string,
		limit?: number,
		exact?: boolean
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/possibleParents`,
			query: {
				when: when,
				currentCollectionId: currentCollectionId,
				title: title,
				date: date,
				limit: limit,
				exact: exact,
			},
		});
	}

	/**
	 * Unfollow collection.
	 * Remove user from collection followers and remove collection from user
	 * followed collections.
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections1(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${id}/unfollow`,
		});
	}

	/**
	 * Get all root collections or collections that do not have a parent
	 * Collections are groupings of datasets
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections5(): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/topLevelCollections`,
		});
	}

	/**
	 * Get all root collections
	 * Collections are groupings of datasets
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections6(): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/rootCollections`,
		});
	}

	/**
	 * Remove subcollection from collection
	 * Collections are groupings of datasets
	 * @param collId
	 * @param subCollId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections2(
		collId: string,
		subCollId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${collId}/removeSubCollection/${subCollId}`,
		});
	}

	/**
	 * List all collections the user can edit
	 * This will check for Permission.AddResourceToCollection and
	 * Permission.EditCollection
	 *
	 * @param when
	 * @param title
	 * @param date
	 * @param limit
	 * @param exact
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections7(
		when?: string,
		title?: string,
		date?: string,
		limit?: number,
		exact?: boolean
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/canEdit`,
			query: {
				when: when,
				title: title,
				date: date,
				limit: limit,
				exact: exact,
			},
		});
	}

	/**
	 * Deleted all collections in trash older than days specified
	 * Server admin action.
	 * @param days
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteCollections1(days?: number): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/collections/clearOldCollectionsTrash`,
			query: {
				days: days,
			},
		});
	}

	/**
	 * Emptying trash collections
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteCollections2(): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/collections/emptyTrash`,
		});
	}

	/**
	 * list trash collections
	 * @param limit
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections8(limit?: number): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/listTrash`,
			query: {
				limit: limit,
			},
		});
	}

	/**
	 * restore a trash collection
	 * This will check for Permission.DeleteCollection
	 *
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putCollections1(collId: string): CancelablePromise<any> {
		return __request({
			method: "PUT",
			path: `/collections/restore/${collId}`,
		});
	}

	/**
	 * Add subcollection to collection
	 * Collections are groupings of datasets
	 * @param collId
	 * @param subCollId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections3(
		collId: string,
		subCollId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${collId}/addSubCollection/${subCollId}`,
		});
	}

	/**
	 * Get child collections in collection
	 * Collections are groupings of datasets
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections9(collId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${collId}/getChildCollections`,
		});
	}

	/**
	 * list all datasets in the collection
	 * Collections are groupings of datasets
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections10(collId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${collId}/datasets`,
		});
	}

	/**
	 * If dataset is in a space, list all collections can be the parent of
	 * the dataset in this space, otherwise list all possiable collections
	 *
	 * Collections are groupings of datasets
	 * @param collId
	 * @param dsId
	 * @param when
	 * @param title
	 * @param date
	 * @param limit default as 12
	 * @param exact default as false
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections11(
		collId: string,
		dsId: string,
		when?: string,
		title?: string,
		date?: string,
		limit?: number,
		exact?: boolean
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${collId}/datasetPossibleParents/${dsId}`,
			query: {
				when: when,
				title: title,
				date: date,
				limit: limit,
				exact: exact,
			},
		});
	}

	/**
	 * Add dataset to collection
	 * Collections are groupings of datasets
	 * @param collId
	 * @param dsId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections4(
		collId: string,
		dsId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${collId}/datasets/${dsId}`,
		});
	}

	/**
	 * Detach a dataset from collection
	 * Collections are groupings of datasets
	 * @param collId
	 * @param dsId
	 * @param ignoreNotFound default as True
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteCollections3(
		collId: string,
		dsId: string,
		ignoreNotFound?: boolean
	): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/collections/${collId}/datasets/${dsId}`,
			query: {
				ignoreNotFound: ignoreNotFound,
			},
		});
	}

	/**
	 * Attach existing preview to collection
	 * Collections are groupings of datasets
	 * @param cId
	 * @param pId
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections5(
		cId: string,
		pId: string,
		requestBody?: {
			extractor_id?: string;
			preview_type?: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${cId}/previews/${pId}`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Follow collection.
	 * Add user to collection followers and add collection to user followed
	 * collections.
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections6(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${id}/follow`,
		});
	}

	/**
	 * Get parent collection ids of collection
	 * Collections are groupings of datasets
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections12(collId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${collId}/getParentCollectionIds`,
		});
	}

	/**
	 * Reindex a collection
	 * Reindex the existing collection, if recursive is set to true it will
	 * also reindex all datasets and files.
	 *
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections7(collId: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${collId}/reindex`,
		});
	}

	/**
	 * Removes root flag from a collection in  a space
	 * Collections are groupings of datasets
	 * @param collId
	 * @param spaceId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections8(
		collId: string,
		spaceId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${collId}/unsetRootFlag/${spaceId}`,
		});
	}

	/**
	 * Checks if we can remove a collection from a space
	 * This will check if the collection has parent collection in this space.
	 * If not, we can remove the collection from the space
	 *
	 * @param collId
	 * @param spaceId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections13(
		collId: string,
		spaceId: string
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${collId}/removeFromSpaceAllowed/${spaceId}`,
		});
	}

	/**
	 * Get child collection ids in collection
	 * Collections are groupings of datasets
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections14(collId: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${collId}/getChildCollectionIds`,
		});
	}

	/**
	 * Create a collection with parent
	 * Collections are groupings of datasets
	 * @param requestBody The body of the POST request to create a collection.
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections9(requestBody?: {
		name: string;
		description?: string;
		space?: string;
		googleAnalytics?: string;
		parentId?: string;
	}): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/newCollectionWithParent`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Update collection description
	 * Takes one argument, a UUID of the collection. Request body takes
	 * key-value pair for the description
	 *
	 * @param collId
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putCollections2(
		collId: string,
		requestBody: {
			description: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "PUT",
			path: `/collections/${collId}/description`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				404: `Not Found`,
			},
		});
	}

	/**
	 * Add root flags for a collection in space
	 * Collections are groupings of datasets
	 * @param collId
	 * @param spaceId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections10(
		collId: string,
		spaceId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${collId}/rootFlag/${spaceId}`,
		});
	}

	/**
	 * Download collection
	 * Downloads all child collections, datasets and files in a collection.
	 * @param id
	 * @param compression default as -1
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections15(
		id: string,
		compression?: number
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/${id}/download`,
			query: {
				compression: compression,
			},
		});
	}

	/**
	 * @deprecated
	 * List all collections the user can view
	 * This will check for Permission.ViewCollection
	 * @param when
	 * @param title
	 * @param date
	 * @param limit
	 * @param exact
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getCollections16(
		when?: string,
		title?: string,
		date?: string,
		limit?: number,
		exact?: boolean
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/collections/list`,
			query: {
				when: when,
				title: title,
				date: date,
				limit: limit,
				exact: exact,
			},
		});
	}

	/**
	 * @deprecated
	 * Remove a dataset from a collection.
	 * @param collId
	 * @param dsId
	 * @param ignoreNotFound
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections11(
		collId: string,
		dsId: string,
		ignoreNotFound: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${collId}/datasetsRemove/${dsId}/${ignoreNotFound}`,
		});
	}

	/**
	 * @deprecated
	 * remove a collection
	 * @param collId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postCollections12(collId: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/collections/${collId}/remove`,
		});
	}
}
