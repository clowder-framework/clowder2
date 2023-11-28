import config from "../app.config";
import { getHeader } from "../utils/common";
import { V2 } from "../openapi";
import { handleErrors } from "./common";

export const FAILED = "FAILED";

export const RECEIVE_FILE_EXTRACTED_METADATA =
	"RECEIVE_FILE_EXTRACTED_METADATA";

export function fetchFileExtractedMetadata(id) {
	const url = `${config.hostname}/api/v2/files/${id}/metadata`;
	return (dispatch) => {
		return fetch(url, { mode: "cors", headers: getHeader() })
			.then((response) => {
				if (response.status === 200) {
					response.json().then((json) => {
						dispatch({
							type: RECEIVE_FILE_EXTRACTED_METADATA,
							extractedMetadata: json,
							receivedAt: Date.now(),
						});
					});
				} else {
					dispatch(handleErrors(response, fetchFileExtractedMetadata(id)));
				}
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchFileExtractedMetadata(id)));
			});
	};
}

export const RECEIVE_PUBLIC_FILE_SUMMARY = "RECEIVE_PUBLIC_FILE_SUMMARY";

export function fetchPublicFileSummary(id) {
	return (dispatch) => {
		return V2.PublicFilesService.getFileSummaryApiV2PublicFilesFileIdSummaryGet(id)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_FILE_SUMMARY,
					fileSummary: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchPublicFileSummary(id)));
			});
	};
}

export const RECEIVE_PUBLIC_FILE_METADATA_JSONLD = "RECEIVE_PUBLIC_FILE_METADATA_JSONLD";

export function fetchPublicFileMetadataJsonld(id) {
	const url = `${config.hostname}/public/files/${id}/metadata.jsonld`;
	return (dispatch) => {
		return fetch(url, { mode: "cors", headers: getHeader() })
			.then((response) => {
				if (response.status === 200) {
					response.json().then((json) => {
						dispatch({
							type: RECEIVE_PUBLIC_FILE_METADATA_JSONLD,
							metadataJsonld: json,
							receivedAt: Date.now(),
						});
					});
				} else {
					dispatch(handleErrors(response, fetchPublicFileMetadataJsonld(id)));
				}
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchPublicFileMetadataJsonld(id)));
			});
	};
}

export const RECEIVE_PUBLIC_PREVIEWS = "RECEIVE_PUBLIC_PREVIEWS";

export function fetchPublicFilePreviews(id) {
	const url = `${config.hostname}/public/files/${id}/getPreviews`;
	return (dispatch) => {
		return fetch(url, { mode: "cors", headers: getHeader() })
			.then((response) => {
				if (response.status === 200) {
					response.json().then((json) => {
						dispatch({
							type: RECEIVE_PUBLIC_PREVIEWS,
							previews: json,
							receivedAt: Date.now(),
						});
					});
				} else {
					dispatch(handleErrors(response, fetchPublicFilePreviews(id)));
				}
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchPublicFilePreviews(id)));
			});
	};
}






// TODO this method will change the selected file version, should get that version first to make sure it exists
export const CHANGE_PUBLIC_SELECTED_VERSION = "CHANGE_PUBLIC_SELECTED_VERSION";

export function changePublicSelectedVersion(fileId, selectedVersion) {
	return (dispatch) => {
		dispatch({
			type: CHANGE_PUBLIC_SELECTED_VERSION,
			version: selectedVersion,
			receivedAt: Date.now(),
		});
	};
}

export const RECEIVE_PUBLIC_VERSIONS = "RECEIVE_PUBLIC_VERSIONS";

export function fetchPublicFileVersions(fileId) {
	return (dispatch) => {
		return V2.PublicFilesService.getFileVersionsApiV2PublicFilesFileIdVersionsGet(fileId)
			.then((json) => {
				// sort by decending order
				const version = json.sort(
					(a, b) => new Date(b["created"]) - new Date(a["created"])
				);
				dispatch({
					type: RECEIVE_PUBLIC_VERSIONS,
					fileVersions: version,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchPublicFileVersions(fileId)));
			});
	};
}

export const DOWNLOAD_PUBLIC_FILE = "DOWNLOAD_PUBLIC_FILE";

export function filePublicDownloaded(
	fileId,
	filename = "",
	fileVersionNum = 0,
	autoSave = true
) {
	return async (dispatch) => {
		if (filename === "") {
			filename = `${fileId}.zip`;
		}
		let endpoint = `${config.hostname}/api/v2/public/files/${fileId}`;
		if (fileVersionNum != 0) endpoint = `${endpoint}?version=${fileVersionNum}`;
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
				type: DOWNLOAD_PUBLIC_FILE,
				blob: blob,
				receivedAt: Date.now(),
			});
		} else {
			dispatch(
				handleErrors(
					response,
					filePublicDownloaded(fileId, filename, fileVersionNum, autoSave)
				)
			);
		}
	};
}
