import config from "../app.config";
import {dataURItoFile, getHeader} from "../utils/common";
import {V2} from "../openapi";
import {handleErrors} from "./common";

export const FAILED = "FAILED";

export const RECEIVE_FILE_EXTRACTED_METADATA = "RECEIVE_FILE_EXTRACTED_METADATA";
export function fetchFileExtractedMetadata(id){
	const url = `${config.hostname}/files/${id}/extracted_metadata`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch({
							type: RECEIVE_FILE_EXTRACTED_METADATA,
							extractedMetadata: json,
							receivedAt: Date.now(),
						});
					});
				}
				else {
					dispatch(handleErrors(response));
				}
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}

export const RECEIVE_FILE_METADATA = "RECEIVE_FILE_METADATA";
export function fetchFileMetadata(id){
	return (dispatch) => {
		return V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(id)
			.then(json => {
				dispatch({
					type: RECEIVE_FILE_METADATA,
					fileMetadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}

export const RECEIVE_FILE_METADATA_JSONLD = "RECEIVE_FILE_METADATA_JSONLD";
export function fetchFileMetadataJsonld(id){
	const url = `${config.hostname}/files/${id}/metadata.jsonld`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch({
							type: RECEIVE_FILE_METADATA_JSONLD,
							metadataJsonld: json,
							receivedAt: Date.now(),
						});
					});
				}
				else {
					dispatch(handleErrors(response));
				}
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}

export const RECEIVE_PREVIEWS = "RECEIVE_PREVIEWS";
export function fetchFilePreviews(id){
	const url = `${config.hostname}/files/${id}/getPreviews`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
			.then((response) => {
				if (response.status === 200) {
					response.json().then(json =>{
						dispatch({
							type: RECEIVE_PREVIEWS,
							previews: json,
							receivedAt: Date.now(),
						});
					});
				}
				else {
					dispatch(handleErrors(response));
				}
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
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
					file: {"id": json["id"]},
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
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
				dispatch(handleErrors(reason));
			});
	};
}
