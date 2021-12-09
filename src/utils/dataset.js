import {getHeader} from "./common";
import config from "../app.config";

import { V2 } from "../openapi/";

export async function createDataset(formData) {
	// let endpoint = `${config.hostname}/datasets/createempty?superAdmin=true`;
	//const endpoint = `${config.hostname}/datasets?superAdmin=true`;

	//const authHeader = getHeader();
	/*authHeader.append("Accept", "application/json");
	authHeader.append("Content-Type", "application/json");*/

	return V2.DatasetsService.saveDatasetApiV2DatasetsPost(formData).catch(reason => {
		if (reason.status === 401) {
			console.error("Failed to create dataset: Not authenticated: ", reason);
			return {};
		} else {
			console.error("Failed to create dataset: ", reason);
			return {};
		}
	}).then(dataset => {
		return dataset;
	});
}

export async function downloadDataset(datasetId, filename = "") {

	if (filename !== "") {
		filename = filename.replace(/\s+/g, "_");
		filename = `${filename}.zip`;
	} else {
		filename = `${datasetId}.zip`;
	}
	const endpoint = `${config.hostname}/datasets/${datasetId}/download?superAdmin=true`;
	const response = await fetch(endpoint, {method: "GET", mode: "cors", headers: await getHeader()});

	if (response.status === 200) {
		const blob = await response.blob();
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
	} else if (response.status === 401) {
		// TODO
		console.log(response.json());
	} else {
		console.log(response.json());
	}

}
