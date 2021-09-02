import {getHeader} from "./common";
import config from "../app.config";

export async function createDataset(formData) {
	let endpoint = `${config.hostname}/clowder/api/datasets/createempty?superAdmin=true`;

	let authHeader = getHeader();
	authHeader.append('Accept', 'application/json');
	authHeader.append('Content-Type', 'application/json');

	let body = JSON.stringify(formData);

	let response = await fetch(endpoint, {
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

export async function downloadDataset(datasetId, filename=null){

	if (filename){
		filename = filename.replace(/\s+/g, "_");
		filename = `${filename}.zip`;
	}
	else{
		filename = `${datasetId}.zip`;
	}
	let endpoint = `${config.hostname}/clowder/api/datasets/${datasetId}/download?superAdmin=true`;
	let response = await fetch(endpoint, {method: "GET", mode: "cors", headers: await getHeader()});

	if (response.status === 200) {
		let blob = await response.blob();
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, filename);
		} else {
			let anchor = window.document.createElement("a");
			anchor.href = window.URL.createObjectURL(blob);
			anchor.download = filename;
			document.body.appendChild(anchor);
			anchor.click();
			document.body.removeChild(anchor);
		}
	}
	else if (response.status === 401) {
		// TODO
		console.log(response.json());
	}
	else {
		console.log(response.json());
	}

}
