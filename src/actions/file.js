import config from "../app.config";
import {getHeader} from "../utils/common";

export const RECEIVE_FILE_METADATA = "RECEIVE_FILE_METADATA";

export function receiveFileMetadata(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			file: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchFileMetadata(id){
	let url = `${config.hostname}api/files/576b0b1ce4b0e899329e8553/metadata`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json =>{
					dispatch(receiveFileMetadata(RECEIVE_FILE_METADATA, json));
				});
			}
			else {
				dispatch(receiveFileMetadata(RECEIVE_FILE_METADATA, []));
			}
		});
	};
}
