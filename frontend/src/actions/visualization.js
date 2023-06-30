import { V2 } from "../openapi";
import { handleErrors } from "./common";
import config from "../app.config";
import { getHeader } from "../utils/common";

export const GET_VIZ_CONFIG = "GET_VIZ_CONFIG";

export function getVizConfig(resourceId) {
	return (dispatch) => {
		return V2.VisualizationsService.getResourceVizconfigApiV2VisualizationsResourceIdConfigGet(
			resourceId
		)
			.then((json) => {
				dispatch({
					type: GET_VIZ_CONFIG,
					receivedAt: Date.now(),
					vizConfig: json,
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, getVizConfig(resourceId)));
			});
	};
}

export const GET_VIZ_DATA = "GET_VIZ_DATA";

export function getVizData(visualizationId) {
	return (dispatch) => {
		return V2.VisualizationsService.getVisualizationApiV2VisualizationsVisualizationIdGet(
			visualizationId
		)
			.then((json) => {
				dispatch({
					type: GET_VIZ_DATA,
					receivedAt: Date.now(),
					vizData: json,
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, getVizData(visualizationId)));
			});
	};
}

export const DOWNLOAD_VIZ_DATA = "DOWNLOAD_VIZ_DATA";

export function downloadVizData(
	visualizationId,
	filename = "",
	autoSave = true
) {
	return async (dispatch) => {
		if (filename === "") {
			// TODO guess extension
			filename = `${visualizationId}.tmp`;
		}
		let endpoint = `${config.hostname}/api/v2/visualizations/download/${visualizationId}`;
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
				type: DOWNLOAD_VIZ_DATA,
				blob: blob,
				receivedAt: Date.now(),
			});
		} else {
			dispatch(
				handleErrors(
					response,
					downloadVizData(visualizationId, filename, autoSave)
				)
			);
		}
	};
}

export const GENERATE_VIZ_URL = "GENERATE_VIZ_URL";

export function generateVizDataDownloadUrl(visualizationId) {
	return async (dispatch) => {
		let endpoint = `${config.hostname}/api/v2/visualizations/download/${visualizationId}`;
		const response = await fetch(endpoint, {
			method: "GET",
			mode: "cors",
			headers: await getHeader(),
		});

		if (response.status === 200) {
			const blob = await response.blob();
			dispatch({
				type: GENERATE_VIZ_URL,
				url: window.URL.createObjectURL(blob),
				receivedAt: Date.now(),
			});
		} else {
			dispatch(
				handleErrors(response, generateVizDataDownloadUrl(visualizationId))
			);
		}
	};
}
