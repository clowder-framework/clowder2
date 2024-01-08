/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";

export class ServiceService {
	/**
	 * Fetch current user's info
	 * Retrieve informatation on the currently logged-in user.
	 *
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getService(): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/me`,
			errors: {
				401: `Not authorized`,
			},
		});
	}

	/**
	 * Gets the status of the system
	 * Returns a nested JSON object that contains the status of Clowder.
	 * This includes health checks, enabled plugins, as well as helpful debug
	 * information, such as the current size of the reindex queue.
	 *
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getService1(): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/status`,
		});
	}

	/**
	 * Fetch children of the given node in the file tree
	 * Fetch children of the given node in the file tree.
	 *
	 * @returns any OK
	 * @throws ApiError
	 */
	public static getService2(): CancelablePromise<any> {
		return __request({
			method: "GET",
			path: `/tree/getChildrenOfNode`,
			errors: {
				401: `Not authorized`,
			},
		});
	}
}
