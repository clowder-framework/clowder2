import {getHeader} from "./common";
import config from "../app.config";
import {logout} from "../actions/user";

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
		// logout();
	} else {
		console.log(response.json());
	}

}
