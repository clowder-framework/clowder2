import config from "../app.config";
import {getHeader} from "../utils/common";

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
	let url = `${config.hostname}/clowder/api/files/${id}/extracted_metadata?superAdmin=true`;
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
	let url = `${config.hostname}/clowder/api/files/${id}/metadata.jsonld?superAdmin=true`;
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
	let url = `${config.hostname}/clowder/api/files/${id}/getPreviews?superAdmin=true`;
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
