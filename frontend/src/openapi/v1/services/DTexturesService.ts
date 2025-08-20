/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { request as __request } from "../core/request";

export class DTexturesService {
	/**
	 * @deprecated
	 * Upload a 3D texture
	 * Upload a 3D texture file to Clowder.
	 *
	 * @returns void
	 * @throws ApiError
	 */
	public static postDTextures(): CancelablePromise<void> {
		return __request({
			method: "POST",
			path: `/3dTextures`,
			errors: {
				401: `Not authorized`,
			},
		});
	}
}
