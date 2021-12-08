import {getHeader} from "./common";
import config from "../app.config";

export async function createDataset(formData) {
	// let endpoint = `${config.hostname}/datasets/createempty?superAdmin=true`;
	const endpoint = `${config.hostname}/datasets?superAdmin=true`;

	const authHeader = getHeader();
	authHeader.append("Accept", "application/json");
	authHeader.append("Content-Type", "application/json");

	const body = JSON.stringify(formData);

	const response = await fetch(endpoint, {
		method: "POST",
		mode: "cors",
		headers: authHeader,
		body: body,
	});

	if (response.status === 200) {
		// {id:xxx}
		return response.json();
	} else if (response.status === 401) {
		// TODO handle error
		return {};
	} else {
		// TODO handle error
		return {};
	}
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
