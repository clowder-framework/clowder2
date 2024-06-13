import { V2 } from "../openapi";
import { handleErrors } from "./common";
import config from "../app.config";
import { getHeader } from "../utils/common";

export const GET_PUBLIC_VIS_CONFIG = "GET_PUBLIC_VIS_CONFIG";

export function getPublicVisConfig(resourceId) {
	return (dispatch) => {
		return V2.PublicVisualizationsService.getResourceVisconfigApiV2PublicVisualizationsResourceIdConfigGet(
			resourceId
		)
			.then((json) => {
				dispatch({
					type: GET_PUBLIC_VIS_CONFIG,
					receivedAt: Date.now(),
					publicVisConfig: json,
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, getPublicVisConfig(resourceId)));
			});
	};
}

export const GET_PUBLIC_VIS_DATA = "GET_PUBLIC_VIS_DATA";

export function getPublicVisData(visualizationId) {
	return (dispatch) => {
		return V2.PublicVisualizationsService.getVisualizationApiV2VisualizationsVisualizationIdGet(
			visualizationId
		)
			.then((json) => {
				dispatch({
					type: GET_PUBLIC_VIS_DATA,
					receivedAt: Date.now(),
					publicVisData: json,
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, getPublicVisData(visualizationId)));
			});
	};
}

export const DOWNLOAD_PUBLIC_VIS_DATA = "DOWNLOAD_PUBLIC_VIS_DATA";

export function downloadPublicVisData(
	visualizationId,
	filename = "",
	autoSave = true
) {
	return async (dispatch) => {
		if (filename === "") {
			// TODO guess extension
			filename = `${visualizationId}.tmp`;
		}
		const endpoint = `${config.hostname}/api/v2/public/visualizations/${visualizationId}/bytes`;
		const response = await fetch(endpoint, {
			method: "GET",
			mode: "cors",
		});

		if (response.status === 200) {
			const blob = await response.blob();
			if (autoSave) {
				if (window.navigator.msSaveOrOpenBlob) {
					window.navigator.msSaveBlob(blob, filename);
				} else {
					const anchor = window.document.createElement("a");
					anchor.href = window.URL.createObjectURL(blob);
					anchor.download = filename;
					document.body.appendChild(anchor);
					anchor.click();
					document.body.removeChild(anchor);
				}
			}

			dispatch({
				type: DOWNLOAD_PUBLIC_VIS_DATA,
				publicBlob: blob,
				receivedAt: Date.now(),
			});
		} else {
			dispatch(
				handleErrors(
					response,
					downloadPublicVisData(visualizationId, filename, autoSave)
				)
			);
		}
	};
}

export const GET_PUBLIC_VIS_DATA_PRESIGNED_URL =
	"GET_PUBLIC_VIS_DATA_PRESIGNED_URL";
export const RESET_PUBLIC_VIS_DATA_PRESIGNED_URL =
	"RESET_PUBLIC_VIS_DATA_PRESIGNED_URL";

export function generatePublicVisPresignedUrl(
	visualizationId,
	expiresInSeconds = 7 * 24 * 3600
) {
	return async (dispatch) => {
		return V2.PublicVisualizationsService.downloadVisualizationUrlApiV2PublicVisualizationsVisualizationIdUrlGet(
			visualizationId,
			expiresInSeconds
		)
			.then((json) => {
				dispatch({
					type: GET_PUBLIC_VIS_DATA_PRESIGNED_URL,
					receivedAt: Date.now(),
					publicPresignedUrl: json["presigned_url"],
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						generatePublicVisPresignedUrl(visualizationId, expiresInSeconds)
					)
				);
			});
	};
}
