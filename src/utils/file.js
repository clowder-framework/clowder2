import {getHeader, dataURItoFile} from "./common";
import config from "../app.config";

// TODO this need to go away in v2; same function already in redux
// TODO this exist because on dataset page we need to call multiple files id to collect their thumbnail
export async function fetchFileMetadata(id){
	const url = `${config.hostname}/clowder/api/files/${id}/metadata?superAdmin=true`;
	const response = await fetch(url, {mode:"cors", headers: getHeader()});
	if (response.status  === 200){
		return await response.json();
	}
	else if  (response.status  === 401){
		// TODO handle error
		return {};
	}
	else {
		// TODO handle error
		return {};
	}
}

export async function uploadFile(formData, selectedDatasetId) {
	const endpoint = `${config.hostname}/clowder/api/datasets/${selectedDatasetId}/files?superAdmin=true`;
	const authHeader = getHeader();
	const body = new FormData();
	formData.map((item) =>{
		if (item["file"] !== undefined){
			body.append("file", dataURItoFile(item["file"]));
		}
	});

	const response = await fetch(endpoint, {
		method: "POST",
		mode: "cors",
		headers: authHeader,
		body: body,
	});

	if (response.status === 200) {
		// {id:xxx}
		// {ids:[{id:xxx}, {id:xxx}]}
		return response.json();
	} else if (response.status === 401) {
		// TODO handle error
		return {};
	} else {
		// TODO handle error
		return {};
	}
}

export async function downloadFile(fileId, filename=null){

	if (!filename){
		filename = `${fileId}.zip`;
	}
	const endpoint = `${config.hostname}/clowder/api/files/${fileId}/blob?superAdmin=true`;
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
	}
	else if (response.status === 401) {
		// TODO
		console.log(response.json());
	}
	else {
		console.log(response.json());
	}

}
