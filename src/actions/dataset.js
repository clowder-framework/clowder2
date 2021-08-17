import config from "../app.config";
import {getHeader} from "../utils/common";

export const RECEIVE_FILES_IN_DATASET= "RECEIVE_FILES_IN_DATASET";
export function receiveFilesInDataset(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			files: json,
			receivedAt: Date.now(),
		});
	};
}
export function fetchFilesInDataset(id){
	let url = `${config.hostname}/clowder/api/datasets/${id}/files?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json =>{
					dispatch(receiveFilesInDataset(RECEIVE_FILES_IN_DATASET, json));
				});
			}
			else {
				dispatch(receiveFilesInDataset(RECEIVE_FILES_IN_DATASET, []));
			}
		});
	};
}

export const RECEIVE_DATASET_ABOUT = "RECEIVE_DATASET_ABOUT";
export function receiveDatasetAbout(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			about: json,
			receivedAt: Date.now(),
		});
	};
}
export function fetchDatasetAbout(id){
	let url = `${config.hostname}/clowder/api/datasets/${id}?superAdmin=true`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json =>{
					dispatch(receiveDatasetAbout(RECEIVE_DATASET_ABOUT, json));
				});
			}
			else {
				dispatch(receiveDatasetAbout(RECEIVE_DATASET_ABOUT, []));
			}
		});
	};
}

export const RECEIVE_DATASETS = "RECEIVE_DATASETS";
export function receiveDatasets(type, json){
	return (dispatch) => {
		dispatch({
			type: type,
			datasets: json,
			receivedAt: Date.now(),
		});
	};
}
export function fetchDatasets(when, date, limit="5"){
	let url = `${config.hostname}/clowder/api/datasets?superAdmin=true&limit=${limit}`;
	if (date) url = `${url}&date=${date}`;
	if (when) url = `${url}&when=${when}`;
	return (dispatch) => {
		return fetch(url, {mode:"cors", headers: getHeader()})
		.then((response) => {
			if (response.status === 200) {
				response.json().then(json =>{
					dispatch(receiveDatasets(RECEIVE_DATASETS, json));
				});
			}
			else {
				dispatch(receiveDatasets(RECEIVE_DATASETS, []));
			}
		});
	};
}
