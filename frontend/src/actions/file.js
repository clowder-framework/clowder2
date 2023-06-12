import config from "../app.config";
import { dataURItoFile, getHeader } from "../utils/common";
import { V2 } from "../openapi";
import { handleErrors } from "./common";

export const FAILED = "FAILED";

export const RECEIVE_FILE_EXTRACTED_METADATA =
	"RECEIVE_FILE_EXTRACTED_METADATA";

export function fetchFileExtractedMetadata(id) {
	const url = `${config.hostname}/files/${id}/extracted_metadata`;
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

export const RECEIVE_FILE_SUMMARY = "RECEIVE_FILE_SUMMARY";

export function fetchFileSummary(id) {
	return (dispatch) => {
		return V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(id)
			.then((json) => {
				dispatch({
					type: RECEIVE_FILE_SUMMARY,
					fileSummary: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchFileSummary(id)));
			});
	};
}

export const RECEIVE_FILE_METADATA_JSONLD = "RECEIVE_FILE_METADATA_JSONLD";

export function fetchFileMetadataJsonld(id) {
	const url = `${config.hostname}/files/${id}/metadata.jsonld`;
	return (dispatch) => {
		return fetch(url, { mode: "cors", headers: getHeader() })
			.then((response) => {
				if (response.status === 200) {
					response.json().then((json) => {
						dispatch({
							type: RECEIVE_FILE_METADATA_JSONLD,
							metadataJsonld: json,
							receivedAt: Date.now(),
						});
					});
				} else {
					dispatch(handleErrors(response, fetchFileMetadataJsonld(id)));
				}
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchFileMetadataJsonld(id)));
			});
	};
}

export const RECEIVE_PREVIEWS = "RECEIVE_PREVIEWS";

export function fetchFilePreviews(id) {
	const url = `${config.hostname}/files/${id}/getPreviews`;
	return (dispatch) => {
		return fetch(url, { mode: "cors", headers: getHeader() })
			.then((response) => {
				if (response.status === 200) {
					response.json().then((json) => {
						dispatch({
							type: RECEIVE_PREVIEWS,
							previews: json,
							receivedAt: Date.now(),
						});
					});
				} else {
					dispatch(handleErrors(response, fetchFilePreviews(id)));
				}
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchFilePreviews(id)));
			});
	};
}

export const DELETE_FILE = "DELETE_FILE";

export function fileDeleted(fileId) {
	return (dispatch) => {
		return V2.FilesService.deleteFileApiV2FilesFileIdDelete(fileId)
			.then((json) => {
				dispatch({
					type: DELETE_FILE,
					file: { id: fileId },
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fileDeleted(fileId)));
			});
	};
}

export const CREATE_FILE = "CREATE_FILE";

export function fileCreated(selectedDatasetId, folderId, formData) {
	return (dispatch) => {
		formData["file"] = dataURItoFile(formData["file"]);
		return V2.DatasetsService.saveFileApiV2DatasetsDatasetIdFilesPost(
			selectedDatasetId,
			formData,
			folderId
		)
			.then((file) => {
				dispatch({
					type: CREATE_FILE,
					file: file,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						fileCreated(selectedDatasetId, formData, folderId)
					)
				);
			});
	};
}

export const RESET_CREATE_FILE = "RESET_CREATE_FILE";

export function resetFileCreated() {
	return (dispatch) => {
		dispatch({
			type: RESET_CREATE_FILE,
			receivedAt: Date.now(),
		});
	};
}

export const UPDATE_FILE = "UPDATE_FILE";

export function fileUpdated(formData, fileId) {
	return (dispatch) => {
		formData["file"] = dataURItoFile(formData["file"]);
		return V2.FilesService.updateFileApiV2FilesFileIdPut(fileId, formData)
			.then((file) => {
				dispatch({
					type: UPDATE_FILE,
					file: file,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fileUpdated(formData, fileId)));
			});
	};
}

export const RECEIVE_VERSIONS = "RECEIVE_VERSIONS";

export function fetchFileVersions(fileId) {
	return (dispatch) => {
		return V2.FilesService.getFileVersionsApiV2FilesFileIdVersionsGet(fileId)
			.then((json) => {
				// sort by decending order
				const version = json.sort(
					(a, b) => new Date(b["created"]) - new Date(a["created"])
				);
				dispatch({
					type: RECEIVE_VERSIONS,
					fileVersions: version,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchFileVersions(fileId)));
			});
	};
}

export const DOWNLOAD_FILE = "DOWNLOAD_FILE";

export function fileDownloaded(fileId, filename = "", fileVersionNum = 0) {
	return async (dispatch) => {
		if (filename === "") {
			filename = `${fileId}.zip`;
		}
		let endpoint = `${config.hostname}/api/v2/files/${fileId}`;
		if (fileVersionNum != 0) endpoint = endpoint + "?version=" + fileVersionNum;
		const response = await fetch(endpoint, {
			method: "GET",
			mode: "cors",
			headers: await getHeader(),
		});

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
			dispatch({
				type: DOWNLOAD_FILE,
				receivedAt: Date.now(),
			});
		} else {
			dispatch(handleErrors(response, fileDownloaded(fileId, filename)));
		}
	};
}

export const SUBMIT_FILE_EXTRACTION = "SUBMIT_FILE_EXTRACTION";

export function submitFileExtractionAction(fileId, extractorName, requestBody) {
	return (dispatch) => {
		return V2.FilesService.getFileExtractApiV2FilesFileIdExtractPost(
			fileId,
			extractorName,
			requestBody
		)
			.then((json) => {
				dispatch({
					type: SUBMIT_FILE_EXTRACTION,
					job_id: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						submitFileExtractionAction(fileId, extractorName, requestBody)
					)
				);
			});
	};
}

export const GENERATE_FILE_URL = "GENERATE_FILE_URL";

export function generateFileDownloadUrl(fileId, fileVersionNum = 0) {
	return async (dispatch) => {
		let url = `${config.hostname}/api/v2/files/${fileId}`;
		if (fileVersionNum > 0) url = url + "?version=" + fileVersionNum;

		const response = await fetch(url, {
			method: "GET",
			mode: "cors",
			headers: await getHeader(),
		});

		if (response.status === 200) {
			const blob = await response.blob();
			dispatch({
				type: GENERATE_FILE_URL,
				url: window.URL.createObjectURL(blob),
				receivedAt: Date.now(),
			});
		} else {
			dispatch(
				handleErrors(response, generateFileDownloadUrl(fileId, fileVersionNum))
			);
		}
	};
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
