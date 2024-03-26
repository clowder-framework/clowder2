/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";

export class AdminService {
	/**
	 * Force a reindex of all resources in Elasticsearch.
	 * Force a reindex of all resources in Elasticsearch.
	 * Must be a server admin.
	 *
	 * @returns void
	 * @throws ApiError
	 */
	public static postAdmin(): CancelablePromise<void> {
		return __request({
			method: "POST",
			path: `/reindex`,
			errors: {
				401: `Not authorized`,
				403: `Forbidden`,
			},
		});
	}

	/**
	 * Update system configuration.
	 * Update system configuration.
	 * Must be a server admin.
	 *
	 * @param requestBody The body of the POST request.
	 * @returns void
	 * @throws ApiError
	 */
	public static postAdmin1(requestBody: {
		theme?: string;
		displayName?: string;
		welcomeMessage?: string;
		googleAnalytics?: string;
		sensors?: string;
		sensor?: string;
		parameters?: string;
		parameter?: string;
		tosText?: string;
		tosHtml?: string;
	}): CancelablePromise<void> {
		return __request({
			method: "POST",
			path: `/admin/configuration`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				401: `Not authorized`,
				403: `Forbidden`,
			},
		});
	}

	/**
	 * Send email to admins.
	 * Send email to admins.
	 * Must be a server admin.
	 *
	 * @param requestBody The body of the POST request.
	 * @returns void
	 * @throws ApiError
	 */
	public static postAdmin2(requestBody: {
		body?: string;
		subject?: string;
	}): CancelablePromise<void> {
		return __request({
			method: "POST",
			path: `/admin/mail`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				401: `Not authorized`,
				403: `Forbidden`,
			},
		});
	}

	/**
	 * Update all users status, set a list of users as active, inactive, admin or normal user.
	 * Update all users status, set a list of users as active, inactive, admin or normal user.
	 * Must be a server admin.
	 *
	 * @param requestBody The body of the POST request.
	 * @returns void
	 * @throws ApiError
	 */
	public static postAdmin3(requestBody: {
		active?: Array<string>;
		inactive?: Array<string>;
		admin?: Array<string>;
		unadmin?: Array<string>;
	}): CancelablePromise<void> {
		return __request({
			method: "POST",
			path: `/admin/users`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				401: `Not authorized`,
				403: `Forbidden`,
			},
		});
	}

	/**
	 * Change themes of the clowder instance.
	 * Change themes of the clowder instance.
	 * Must be a server admin.
	 *
	 * @param requestBody The body of the POST request.
	 * @returns void
	 * @throws ApiError
	 */
	public static postAdmin4(requestBody: {
		theme?: string;
		displayName?: string;
		welcomeMessage?: string;
		googleAnalytics?: string;
	}): CancelablePromise<void> {
		return __request({
			method: "POST",
			path: `/changeAppearance`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				401: `Not authorized`,
			},
		});
	}
}
