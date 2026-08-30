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

export function createFile(selectedDatasetId, folderId, selectedFile) {
	return (dispatch) => {
		const formData = new FormData();
		formData["file"] = selectedFile;
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
						createFile(selectedDatasetId, folderId, selectedFile)
					)
				);
			});
	};
}

export const CREATE_FILES = "CREATE_FILES";

export function createFiles(selectedDatasetId, selectedFiles, folderId) {
	return (dispatch) => {
		const formData = new FormData();
		const tmp = [];
		if (selectedFiles.length > 0) {
			for (let i = 0; i < selectedFiles.length; i++) {
				tmp.push(selectedFiles[i]);
			}
		}
		formData["files"] = tmp;

		return V2.DatasetsService.saveFilesApiV2DatasetsDatasetIdFilesMultiplePost(
			selectedDatasetId,
			formData,
			folderId
		)
			.then((files) => {
				dispatch({
					type: CREATE_FILES,
					files: files,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						createFiles(selectedDatasetId, selectedFiles, folderId)
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

export const RESET_CREATE_FILES = "RESET_CREATE_FILES";

export function resetFilesCreated() {
	return (dispatch) => {
		dispatch({
			type: RESET_CREATE_FILES,
			receivedAt: Date.now(),
		});
	};
}

export const UPDATE_FILE = "UPDATE_FILE";

export function updateFile(selectedFile, fileId) {
	return (dispatch) => {
		const formData = new FormData();
		formData["file"] = selectedFile;
		return V2.FilesService.updateFileApiV2FilesFileIdPut(fileId, formData)
			.then((file) => {
				dispatch({
					type: UPDATE_FILE,
					file: file,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, updateFile(selectedFile, fileId)));
			});
	};
}

// TODO this method will change the selected file version, should get that version first to make sure it exists
export const CHANGE_SELECTED_VERSION = "CHANGE_SELECTED_VERSION";

export function changeSelectedVersion(fileId, selectedVersion) {
	return (dispatch) => {
		dispatch({
			type: CHANGE_SELECTED_VERSION,
			selected_version: selectedVersion,
			receivedAt: Date.now(),
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

export function fileDownloaded(
	fileId,
	filename = "",
	fileVersionNum = 0,
	autoSave = true
) {
	return async (dispatch) => {
		if (filename === "") {
			filename = `${fileId}.zip`;
		}
		let endpoint = `${config.hostname}/api/v2/files/${fileId}`;
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
				type: DOWNLOAD_FILE,
				blob: blob,
				receivedAt: Date.now(),
			});
		} else {
			dispatch(
				handleErrors(
					response,
					fileDownloaded(fileId, filename, fileVersionNum, autoSave)
				)
			);
		}
	};
}

export const RECEIVE_FILE_PRESIGNED_URL = "RECEIVE_FILE_PRESIGNED_URL";
export const RESET_FILE_PRESIGNED_URL = "RESET_FILE_PRESIGNED_URL";

export function generateFilePresignedUrl(
	fileId,
	fileVersionNum = null,
	expiresInSeconds = 7 * 24 * 3600
) {
	return async (dispatch) => {
		return V2.FilesService.downloadFileUrlApiV2FilesFileIdUrlGet(
			fileId,
			fileVersionNum,
			expiresInSeconds
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_FILE_PRESIGNED_URL,
					receivedAt: Date.now(),
					presignedUrl: json["presigned_url"],
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						generateFilePresignedUrl(fileId, fileVersionNum, expiresInSeconds)
					)
				);
			});
	};
}

export const SUBMIT_FILE_EXTRACTION = "SUBMIT_FILE_EXTRACTION";

export function submitFileExtractionAction(
	fileId,
	extractorName,
	datasetId,
	requestBody
) {
	return (dispatch) => {
		return V2.FilesService.postFileExtractApiV2FilesFileIdExtractPost(
			fileId,
			extractorName,
			null,
			datasetId,
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
						submitFileExtractionAction(
							fileId,
							extractorName,
							null,
							datasetId,
							requestBody
						)
					)
				);
			});
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

export const INCREMENT_FILE_DOWNLOADS = "INCREMENT_FILE_DOWNLOADS";
