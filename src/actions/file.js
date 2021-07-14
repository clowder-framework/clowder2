import config from "../app.config";

export const RECEIVE_FILE = "RECEIVE_FILE";

export function receiveFile(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			file: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchFile(id){
	let url = `${config.geoServerWFS}?service=WFS&version=1.0.0&request=GetFeature&outputFormat=JSON`;
	url = `${url}&typename=${id}&sortBy=${sortColumnName}+D`;
	return (dispatch) => {
		return fetch(url, {mode:"cors"})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json =>{
					dispatch(receiveFile(RECEIVE_FILE, json["features"]));
				});
			}
			else {
				dispatch(receiveFile(RECEIVE_FILE, []));
			}
		});
	};
}
