import config from "../app.config";
import { V2 } from "../openapi";
import { handleErrors } from "./common";

export const RECEIVE_PUBLIC_FILE_METADATA = "RECEIVE_PUBLIC_FILE_METADATA";

export function fetchPublicFileMetadata(fileId, version) {
	return (dispatch) => {
		return V2.PublicFilesService.getFileMetadataApiV2PublicFilesFileIdMetadataGet(
			fileId,
			version,
			false
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_FILE_METADATA,
					publicFileMetadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, fetchPublicFileMetadata(fileId, version))
				);
			});
	};
}

export const RECEIVE_PUBLIC_FILE_SUMMARY = "RECEIVE_PUBLIC_FILE_SUMMARY";

export function fetchPublicFileSummary(id) {
	return (dispatch) => {
		return V2.PublicFilesService.getFileSummaryApiV2PublicFilesFileIdSummaryGet(
			id
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_FILE_SUMMARY,
					publicFileSummary: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchPublicFileSummary(id)));
			});
	};
}

export const RECEIVE_PUBLIC_PREVIEWS = "RECEIVE_PUBLIC_PREVIEWS";

export function fetchPublicFilePreviews(id) {
	const url = `${config.hostname}/public_files/${id}/getPreviews`;
	return (dispatch) => {
		return fetch(url, { mode: "cors" })
			.then((response) => {
				if (response.status === 200) {
					response.json().then((json) => {
						dispatch({
							type: RECEIVE_PUBLIC_PREVIEWS,
							publicPreviews: json,
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
			publicVersion: selectedVersion,
			receivedAt: Date.now(),
		});
	};
}

export const RECEIVE_PUBLIC_VERSIONS = "RECEIVE_PUBLIC_VERSIONS";

export function fetchPublicFileVersions(fileId, skip, limit) {
	return (dispatch) => {
		return V2.PublicFilesService.getFileVersionsApiV2PublicFilesFileIdVersionsGet(
			fileId,
			skip,
			limit
		)
			.then((json) => {
				// sort by decending order
				const version = json.sort(
					(a, b) => new Date(b["created"]) - new Date(a["created"])
				);
				dispatch({
					type: RECEIVE_PUBLIC_VERSIONS,
					publicFileVersions: version,
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
		let endpoint = `${config.hostname}/api/v2/public_files/${fileId}`;
		if (fileVersionNum != 0) endpoint = `${endpoint}?version=${fileVersionNum}`;
		const response = await fetch(endpoint, {
			method: "GET",
			mode: "cors",
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
				publicBlob: blob,
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

export const INCREMENT_PUBLIC_FILE_DOWNLOADS =
	"INCREMENT_PUBLIC_FILE_DOWNLOADS";
