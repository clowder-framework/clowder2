/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Space } from "../models/Space";
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";

export class SpacesService {
	/**
	 * List spaces the user can view
	 * Retrieves information about spaces
	 * @param when
	 * @param title
	 * @param date
	 * @param limit default as 12
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getSpaces(
		when?: string,
		title?: string,
		date?: string,
		limit?: number
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/spaces`,
			query: {
				when: when,
				title: title,
				date: date,
				limit: limit,
			},
		});
	}

	/**
	 * Create a space
	 * Spaces are groupings of collections and datasets.
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces(requestBody: Space): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				400: `The server could not process your request, this happens for example when
                 * the id specified is not of the correct form. See the message field for
                 * more information.
                 * `,
			},
		});
	}

	/**
	 * Get a space
	 * Retrieves information about a space
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getSpaces1(id: string): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/spaces/${id}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Remove a space
	 * Does not delete the individual datasets and collections in the space.
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static deleteSpaces(id: string): CancelablePromise<any> {
		return __request({
			method: "DELETE",
			path: `/spaces/${id}`,
		});
	}

	/**
	 * Remove a dataset from a space
	 * Spaces are groupings of collections and datasets.
	 * @param spaceId
	 * @param datasetId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces1(
		spaceId: string,
		datasetId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${spaceId}/removeDataset/${datasetId}`,
		});
	}

	/**
	 * List UUIDs of all collections in a space
	 * Spaces are groupings of collections and datasets.
	 * @param id
	 * @param limit default as 12
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getSpaces2(id: string, limit?: number): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/spaces/${id}/collections`,
			query: {
				limit: limit,
			},
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * List UUIDs of all datasets in a space
	 * Spaces are groupings of collections and datasets.
	 * @param id
	 * @param limit default as 12
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getSpaces3(id: string, limit?: number): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/spaces/${id}/datasets`,
			query: {
				limit: limit,
			},
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Set the space as verified
	 * Server Admin Action
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static putSpaces(id: string): CancelablePromise<any> {
		return __request({
			method: "PUT",
			path: `/spaces/${id}/verify`,
		});
	}

	/**
	 * Associate a collection to a space
	 * Spaces are groupings of collections and datasets.
	 * @param spaceId
	 * @param collectionId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces2(
		spaceId: string,
		collectionId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${spaceId}/addCollectionToSpace/${collectionId}`,
		});
	}

	/**
	 * Reject Request
	 * Reject user's request to the space, remove the request and send email to
	 * the request user
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces3(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${id}/rejectRequest`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Accept Request
	 * Accept user's request to the space and assign a specific Role, remove
	 * the request and send email to the request user
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces4(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${id}/acceptRequest`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Remove a collection from a space
	 * Spaces are groupings of collections and datasets.
	 * @param spaceId
	 * @param collectionId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces5(
		spaceId: string,
		collectionId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${spaceId}/removeCollection/${collectionId}`,
			errors: {
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * Update the user information associated with a space
	 * Spaces are groupings of collections and datasets.
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces6(
		id: string,
		requestBody: {
			/**
			 * A map that contains a role level as a key and a comma separated String of user IDs as the value
			 */
			rolesandusers?: any;
		}
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${id}/updateUsers`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				400: `rolesandusers data is missing from the updateUsers call.`,
				404: `The requested resource was not found`,
			},
		});
	}

	/**
	 * List spaces the user can add to
	 * Retrieves a list of spaces that the user has permission to add to
	 * @param when
	 * @param title
	 * @param date
	 * @param limit default as 12
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getSpaces4(
		when?: string,
		title?: string,
		date?: string,
		limit?: number
	): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/spaces/canEdit`,
			query: {
				when: when,
				title: title,
				date: date,
				limit: limit,
			},
		});
	}

	/**
	 * Remove a user from a space
	 * Spaces are groupings of collections and datasets.
	 * @param id
	 * @param removeUser the UUID of the user
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces7(
		id: string,
		removeUser: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${id}/removeUser`,
			query: {
				removeUser: removeUser,
			},
		});
	}

	/**
	 * Update the information associated with a space
	 * Spaces are groupings of collections and datasets.
	 * @param id
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces8(
		id: string,
		requestBody: {
			name: string;
			description: string;
			timetolive: string;
			enabled: boolean;
			access: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${id}/update`,
			body: requestBody,
			mediaType: "application/json",
		});
	}

	/**
	 * Unfollow space
	 * Remove user from space followers and remove space from user followed
	 * spaces.
	 *
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces9(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${id}/unfollow`,
		});
	}

	/**
	 * Follow space
	 * Add user to space followers and add space to user followed spaces.
	 * @param id
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces10(id: string): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${id}/follow`,
		});
	}

	/**
	 * Associate a dataset to a space
	 * Spaces are groupings of collections and datasets.
	 * @param spaceId
	 * @param datasetId
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces11(
		spaceId: string,
		datasetId: string
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${spaceId}/addDatasetToSpace/${datasetId}`,
		});
	}

	/**
	 * add metadata definition to a space
	 * If uri is not defined, the uri will be set as
	 * "http://clowder.ncsa.illinois.edu/metadata/{uuid}#CamelCase"
	 *
	 * @param spaceId
	 * @param requestBody
	 * @returns any OK
	 * @throws ApiError
	 */
	public static postSpaces12(
		spaceId: string,
		requestBody: {
			label: string;
			type: string;
			description: string;
			uri?: string;
		}
	): CancelablePromise<any> {
		return __request({
			method: "POST",
			path: `/spaces/${spaceId}/metadata`,
			body: requestBody,
			mediaType: "application/json",
		});
	}
}
