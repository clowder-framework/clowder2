import {getHeader} from "./common";
import {V2} from "../openapi";
import config from "../app.config";
import {logout} from "../actions/user";

// TODO this need to go away in v2; same function already in redux
// TODO this exist because on dataset page we need to call multiple files id to collect their thumbnail
// TODO fixme when thumbnail is available in V2
export async function fetchFileMetadata(id) {
	return V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(id).catch(reason => {
		if (reason.status === 401) {
			console.error("Failed to get file summary: Not authenticated: ", reason);
			logout();
			return {};
		} else {
			console.error("Failed to get file summary: ", reason);
			return {};
		}
	}).then(fileSummary => {
		return fileSummary;
	});
}

export async function downloadFile(fileId, filename = "") {
	if (filename === "") {
		filename = `${fileId}.zip`;
	}
	const endpoint = `${config.hostname}/api/v2/files/${fileId}`;
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
		logout();
		console.log(response.json());
	} else {
		console.log(response.json());
	}

	// TODO FIXME: this doesn't work. I think on swagger.json it needs a flag x-is-file to be able to get the response as a blob
	// V2.FilesService.downloadFileApiV2FilesFileIdGet(fileId).catch(reason => {
	// 	if (reason.status === 401) {
	// 		console.error("Failed to download file: Not authenticated: ", reason);
	// 		return {};
	// 	} else {
	// 		console.error("Failed to download file: ", reason);
	// 		return {};
	// 	}
	// })
	// 	.then(response => response.blob())
	// 	.then(blob => {
	// 		if (window.navigator.msSaveOrOpenBlob) {
	// 			window.navigator.msSaveBlob(blob, filename);
	// 		} else {
	// 			const anchor = window.document.createElement("a");
	// 			anchor.href = window.URL.createObjectURL(blob);
	// 			anchor.download = filename;
	// 			document.body.appendChild(anchor);
	// 			anchor.click();
	// 			document.body.removeChild(anchor);
	// 		}
	// 	});
}
