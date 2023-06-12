import { V2 } from "../openapi";
import config from "../app.config";
import { getHeader } from "./common";

// TODO this need to go away in v2; same function already in redux
// TODO this exist because on dataset page we need to call multiple files id to collect their thumbnail
// TODO fixme when thumbnail is available in V2
// TODO moving it into redux cuz i need to dispatch the error message
export async function fetchFileMetadata(id) {
	return V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(id)
		.then((fileSummary) => {
			return fileSummary;
		})
		.catch((reason) => {
			if (reason.status === 401) {
				console.error(
					"Failed to get file summary: Not authenticated: ",
					reason
				);
				// logout();
				return {};
			} else {
				console.error("Failed to get file summary: ", reason);
				return {};
			}
		});
}

export async function generateFileDownloadUrl(
	fileId,
	filename = "",
	fileVersionNum = 0
) {
	let url = `${config.hostname}/api/v2/files/${fileId}`;
	if (fileVersionNum > 0) url = endpoint + "?version=" + fileVersionNum;
	const response = await fetch(url, {
		method: "GET",
		mode: "cors",
		headers: await getHeader(),
	});

	if (response.status === 200) {
		const blob = await response.blob();
		if (window.navigator.msSaveOrOpenBlob) {
			window.navigator.msSaveBlob(blob, filename);
			return null;
		} else {
			return window.URL.createObjectURL(blob);
		}
	} else if (response.status === 401) {
		// TODO handle error
		// logout();
		return null;
	} else {
		// TODO handle error
		return null;
	}
}
