/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";

export class ProxyService {
	/**
	 * Proxy a GET request to an endpoint specified in the proxy's configuration.
	 * Access to the endpoint will be restricted by Clowder authentication.
	 * @param endpointKey
	 * @returns void
	 * @throws ApiError
	 */
	public static getProxy(endpointKey: string): CancelablePromise<void> {
		return __request({
			method: "GET",
			path: `/proxy/${endpointKey}`,
			errors: {
				401: `Not authorized`,
				404: `Endpoint not configured`,
			},
		});
	}

	/**
	 * Proxy a PUT request to an endpoint specified in the proxy's configuration.
	 * Access to the endpoint will be restricted by Clowder authentication.
	 * @param endpointKey
	 * @param requestBody The body of the PUT request to proxy.
	 * @returns void
	 * @throws ApiError
	 */
	public static putProxy(
		endpointKey: string,
		requestBody?: any
	): CancelablePromise<void> {
		return __request({
			method: "PUT",
			path: `/proxy/${endpointKey}`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				401: `Not authorized`,
				404: `Endpoint not configured`,
			},
		});
	}

	/**
	 * Proxy a POST request to an endpoint specified in the proxy's configuration.
	 * Access to the endpoint will be restricted by Clowder authentication.
	 * @param endpointKey
	 * @param requestBody The body of the POST request to proxy.
	 * @returns void
	 * @throws ApiError
	 */
	public static postProxy(
		endpointKey: string,
		requestBody?: any
	): CancelablePromise<void> {
		return __request({
			method: "POST",
			path: `/proxy/${endpointKey}`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				401: `Not authorized`,
				404: `Endpoint not configured`,
			},
		});
	}

	/**
	 * Proxy a DELETE request to an endpoint specified in the proxy's configuration.
	 * Access to the endpoint will be restricted by Clowder authentication.
	 * @param endpointKey
	 * @returns void
	 * @throws ApiError
	 */
	public static deleteProxy(endpointKey: string): CancelablePromise<void> {
		return __request({
			method: "DELETE",
			path: `/proxy/${endpointKey}`,
			errors: {
				401: `Not authorized`,
				404: `Endpoint not configured`,
			},
		});
	}

	/**
	 * Proxy a GET request to an endpoint specified in the proxy's configuration.
	 * Access to the endpoint will be restricted by Clowder authentication.
	 * @param endpointKey
	 * @param pathSuffix
	 * @returns void
	 * @throws ApiError
	 */
	public static getProxy1(
		endpointKey: string,
		pathSuffix: string
	): CancelablePromise<void> {
		return __request({
			method: "GET",
			path: `/proxy/${endpointKey}/${pathSuffix}`,
			errors: {
				401: `Not authorized`,
				404: `Endpoint not configured`,
			},
		});
	}

	/**
	 * Proxy a PUT request to an endpoint specified in the proxy's configuration.
	 * Access to the endpoint will be restricted by Clowder authentication.
	 * @param endpointKey
	 * @param pathSuffix
	 * @param requestBody The body of the PUT request to proxy.
	 * @returns void
	 * @throws ApiError
	 */
	public static putProxy1(
		endpointKey: string,
		pathSuffix: string,
		requestBody?: any
	): CancelablePromise<void> {
		return __request({
			method: "PUT",
			path: `/proxy/${endpointKey}/${pathSuffix}`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				401: `Not authorized`,
				404: `Endpoint not configured`,
			},
		});
	}

	/**
	 * Proxy a POST request to an endpoint specified in the proxy's configuration.
	 * Access to the endpoint will be restricted by Clowder authentication.
	 * @param endpointKey
	 * @param pathSuffix
	 * @param requestBody The body of the POST request to proxy.
	 * @returns void
	 * @throws ApiError
	 */
	public static postProxy1(
		endpointKey: string,
		pathSuffix: string,
		requestBody?: any
	): CancelablePromise<void> {
		return __request({
			method: "POST",
			path: `/proxy/${endpointKey}/${pathSuffix}`,
			body: requestBody,
			mediaType: "application/json",
			errors: {
				401: `Not authorized`,
				404: `Endpoint not configured`,
			},
		});
	}

	/**
	 * Proxy a DELETE request to an endpoint specified in the proxy's configuration.
	 * Access to the endpoint will be restricted by Clowder authentication.
	 * @param endpointKey
	 * @param pathSuffix
	 * @returns void
	 * @throws ApiError
	 */
	public static deleteProxy1(
		endpointKey: string,
		pathSuffix: string
	): CancelablePromise<void> {
		return __request({
			method: "DELETE",
			path: `/proxy/${endpointKey}/${pathSuffix}`,
			errors: {
				401: `Not authorized`,
				404: `Endpoint not configured`,
			},
		});
	}
}
