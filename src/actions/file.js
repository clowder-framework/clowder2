import config from "../app.config";
import {dataURItoFile, getHeader} from "../utils/common";
import {V2} from "../openapi";

export const FAILED = "FAILED";

export const RECEIVE_FILE_EXTRACTED_METADATA = "RECEIVE_FILE_EXTRACTED_METADATA";
export function receiveFileExtractedMetadata(type, json, reason=""){
	return (dispatch) => {
		dispatch({
			type: type,
			extractedMetadata: json,
			reason: reason,
			receivedAt: Date.now(),
		});
	};
}
export function fetchFileExtractedMetadata(id){
	const url = `${config.hostname}/files/${id}/extracted_metadata`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch(receiveFileExtractedMetadata(RECEIVE_FILE_EXTRACTED_METADATA, json));
					});
				}
				else {
					dispatch(receiveFileExtractedMetadata(FAILED, [], "Cannot fetch extracted file metadata!"));
				}
			})
			.catch(reason => {
				dispatch(receiveFileExtractedMetadata(FAILED, [], `Cannot fetch extracted file metadata!`));
			});
	};
}

export const RECEIVE_FILE_METADATA = "RECEIVE_FILE_METADATA";
export function receiveFileMetadata(type, json, reason=""){
	return (dispatch) => {
		dispatch({
			type: type,
			fileMetadata: json,
			reason: reason,
			receivedAt: Date.now(),
		});
	};
}
export function fetchFileMetadata(id){
	return (dispatch) => {
		return V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(id)
			.then(json => {
				dispatch(receiveFileMetadata(RECEIVE_FILE_METADATA, json));
			})
			.catch(reason => {
				if (reason.status === 401){
					console.log("Unauthorized!");
				// logout();
				}
				dispatch(receiveFileMetadata(FAILED, [], `Cannot fetch file metadata! ${reason}`));
			});
	};
}

export const RECEIVE_FILE_METADATA_JSONLD = "RECEIVE_FILE_METADATA_JSONLD";
export function receiveFileMetadataJsonld(type, json, reason=""){
	return (dispatch) => {
		dispatch({
			type: type,
			metadataJsonld: json,
			receivedAt: Date.now(),
			reason: reason
		});
	};
}
export function fetchFileMetadataJsonld(id){
	const url = `${config.hostname}/files/${id}/metadata.jsonld`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch(receiveFileMetadataJsonld(RECEIVE_FILE_METADATA_JSONLD, json));
					});
				}
				else {
					dispatch(receiveFileMetadataJsonld(FAILED, [], "Cannot fetch file metadata data jsonld!"));
				}
			})
			.catch(reason => {
				dispatch(receiveFileMetadataJsonld(FAILED, [], `Cannot fetch file metadata data jsonld!`));
			});
	};
}

export const RECEIVE_PREVIEWS = "RECEIVE_PREVIEWS";
export function receiveFilePreviews(type, json, reason=""){
	return (dispatch) => {
		dispatch({
			type: type,
			previews: json,
			receivedAt: Date.now(),
			reason: reason
		});
	};
}
export function fetchFilePreviews(id){
	const url = `${config.hostname}/files/${id}/getPreviews`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch(receiveFilePreviews(RECEIVE_PREVIEWS, json));
					});
				}
				else {
					dispatch(receiveFileMetadataJsonld(FAILED, [], "Cannot fetch file previews!"));
				}
			})
			.catch(reason => {
				dispatch(receiveFileMetadataJsonld(FAILED, [], `Cannot fetch file previews!`));
			});
	};
}

export const DELETE_FILE = "DELETE_FILE";
export function fileDeleted(fileId){
	return (dispatch) => {
		return V2.FilesService.deleteFileApiV2FilesFileIdDelete(fileId)
			.then(json => {
				dispatch({
					type: DELETE_FILE,
					file: {"id": fileId},
					reason: "",
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				if (reason.status === 401){
					console.log("Unauthorized!");
				// logout();
				}
				dispatch({
					type: FAILED,
					file: {},
					receivedAt: Date.now(),
					reason: `Cannot delete file! ${reason}`,
				});
			});
	};
}

export const CREATE_FILE = "CREATE_FILE";
export function fileCreated(formData, selectedDatasetId){
	return (dispatch) => {
		formData["file"] = dataURItoFile(formData["file"]);
		return V2.FilesService.saveFileApiV2FilesDatasetIdPost(selectedDatasetId, formData)
			.then(file => {
				dispatch({
					type: CREATE_FILE,
					file: file,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				if (reason.status === 401) {
					console.error("Failed to create file: Not authenticated: ", reason);
				// logout();
				}
				dispatch({
					type: FAILED,
					file: {},
					reason: `Cannot create file! ${reason}`,
					receivedAt: Date.now(),
				});
			});
	};
}
