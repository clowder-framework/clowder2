import config from "../app.config";
import {dataURItoFile, getHeader} from "../utils/common";
import {V2} from "../openapi";
import {RECEIVE_DATASET_ABOUT, receiveDatasetAbout} from "./dataset";
import {logout} from "./user";

export const RECEIVE_FILE_EXTRACTED_METADATA = "RECEIVE_FILE_EXTRACTED_METADATA";
export function receiveFileExtractedMetadata(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			extractedMetadata: json,
			receivedAt: Date.now(),
		});
	};
}
export function fetchFileExtractedMetadata(id){
	const url = `${config.hostname}/files/${id}/extracted_metadata?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch(receiveFileExtractedMetadata(RECEIVE_FILE_EXTRACTED_METADATA, json));
					});
				}
				else {
					dispatch(receiveFileExtractedMetadata(RECEIVE_FILE_EXTRACTED_METADATA, []));
				}
			});
	};
}

export const RECEIVE_FILE_METADATA = "RECEIVE_FILE_METADATA";
export function receiveFileMetadata(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			fileMetadata: json,
			receivedAt: Date.now(),
		});
	};
}
export function fetchFileMetadata(id){
	return (dispatch) => {
		return V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(id).catch(reason => {
			if (reason.status === 401){
				console.log("Unauthorized!");
				// logout();
			}
			dispatch(receiveFileMetadata(RECEIVE_FILE_METADATA, []));
		}).then(json => {
			dispatch(receiveFileMetadata(RECEIVE_FILE_METADATA, json));
		});
	};
}

export const RECEIVE_FILE_METADATA_JSONLD = "RECEIVE_FILE_METADATA_JSONLD";
export function receiveFileMetadataJsonld(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			metadataJsonld: json,
			receivedAt: Date.now(),
		});
	};
}
export function fetchFileMetadataJsonld(id){
	const url = `${config.hostname}/files/${id}/metadata.jsonld?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch(receiveFileMetadataJsonld(RECEIVE_FILE_METADATA_JSONLD, json));
					});
				}
				else {
					dispatch(receiveFileMetadataJsonld(RECEIVE_FILE_METADATA_JSONLD, []));
				}
			});
	};
}

export const RECEIVE_PREVIEWS = "RECEIVE_PREVIEWS";
export function receiveFilePreviews(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			previews: json,
			receivedAt: Date.now(),
		});
	};
}
export function fetchFilePreviews(id){
	const url = `${config.hostname}/files/${id}/getPreviews?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch(receiveFilePreviews(RECEIVE_PREVIEWS, json));
					});
				}
				else {
					dispatch(receiveFileMetadataJsonld(RECEIVE_PREVIEWS, []));
				}
			});
	};
}

export const DELETE_FILE = "DELETE_FILE";
export function fileDeleted(fileId){
	return (dispatch) => {
		return V2.FilesService.deleteFileApiV2FilesFileIdDelete(fileId).catch(reason => {
			if (reason.status === 401){
				console.log("Unauthorized!");
				// logout();
			}
			dispatch({
				type: DELETE_FILE,
				file: {"id": null, "status": reason["status"] === undefined ? reason["status"] : "fail"},
				receivedAt: Date.now(),
			});
		}).then(json => {
			dispatch({
				type: DELETE_FILE,
				file: {"id": fileId, "status": json["status"]===undefined? json["status"]:"success"},
				receivedAt: Date.now(),
			});
		});
	};
}

export const CREATE_FILE = "CREATE_FILE";
export function fileCreated(formData, selectedDatasetId){
	return (dispatch) => {
		formData["file"] = dataURItoFile(formData["file"]);
		return V2.FilesService.saveFileApiV2FilesDatasetIdPost(selectedDatasetId, formData).catch(reason => {
			if (reason.status === 401) {
				console.error("Failed to create file: Not authenticated: ", reason);
				// logout();
			}
			dispatch({
				type: CREATE_FILE,
				file: {},
				receivedAt: Date.now(),
			});
		}).then(file => {
			dispatch({
				type: CREATE_FILE,
				file: file,
				receivedAt: Date.now(),
			});
		});
	};
}
