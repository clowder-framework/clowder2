import { V2 } from "../openapi";
import { handleErrors } from "./common";
import config from "../app.config";
import { getHeader } from "../utils/common";

export const GET_VIS_CONFIG = "GET_VIS_CONFIG";

export function getVisConfig(resourceId) {
	return (dispatch) => {
		return V2.VisualizationsService.getResourceVisconfigApiV2VisualizationsResourceIdConfigGet(
			resourceId
		)
			.then((json) => {
				dispatch({
					type: GET_VIS_CONFIG,
					receivedAt: Date.now(),
					visConfig: json,
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, getVisConfig(resourceId)));
			});
	};
}

export const GET_VIS_DATA = "GET_VIS_DATA";

export function getVisData(visualizationId) {
	return (dispatch) => {
		return V2.VisualizationsService.getVisualizationApiV2VisualizationsVisualizationIdGet(
			visualizationId
		)
			.then((json) => {
				dispatch({
					type: GET_VIS_DATA,
					receivedAt: Date.now(),
					visData: json,
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, getVisData(visualizationId)));
			});
	};
}

export const DOWNLOAD_VIS_DATA = "DOWNLOAD_VIS_DATA";

export function downloadVisData(
	visualizationId,
	filename = "",
	autoSave = true
) {
	return async (dispatch) => {
		if (filename === "") {
			// TODO guess extension
			filename = `${visualizationId}.tmp`;
		}
		const endpoint = `${config.hostname}/api/v2/visualizations/${visualizationId}/bytes`;
		const response = await fetch(endpoint, {
			method: "GET",
			mode: "cors",
			headers: await getHeader(),
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
				type: DOWNLOAD_VIS_DATA,
				blob: blob,
				receivedAt: Date.now(),
			});
		} else {
			dispatch(
				handleErrors(
					response,
					downloadVisData(visualizationId, filename, autoSave)
				)
			);
		}
	};
}

export const GET_VIS_DATA_PRESIGNED_URL = "GET_VIS_DATA_PRESIGNED_URL";
export const RESET_VIS_DATA_PRESIGNED_URL = "RESET_VIS_DATA_PRESIGNED_URL";

export function generateVisPresignedUrl(
	visualizationId,
	expiresInSeconds = 7 * 24 * 3600
) {
	return async (dispatch) => {
		return V2.VisualizationsService.downloadVisualizationUrlApiV2VisualizationsVisualizationIdUrlGet(
			visualizationId,
			expiresInSeconds
		)
			.then((json) => {
				dispatch({
					type: GET_VIS_DATA_PRESIGNED_URL,
					receivedAt: Date.now(),
					presignedUrl: json["presigned_url"],
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						generateVisPresignedUrl(visualizationId, expiresInSeconds)
					)
				);
			});
	};
}
