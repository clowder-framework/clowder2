import config from "../app.config";
import {getHeader} from "../utils/common";
import {V2} from "../openapi";
import {logout} from "./user";

export const RECEIVE_FILES_IN_DATASET = "RECEIVE_FILES_IN_DATASET";

export function receiveFilesInDataset(type, json) {
	return (dispatch) => {
		dispatch({
			type: type,
			files: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchFilesInDataset(id){
	return (dispatch) => {
		return V2.DatasetsService.getDatasetFilesApiV2DatasetsDatasetIdFilesGet(id).catch(reason => {
			if (reason.status === 401){
				console.log("Unauthorized!");
				// logout();
			}
			dispatch(receiveFilesInDataset(RECEIVE_FILES_IN_DATASET, []));
		}).then(json => {
			dispatch(receiveFilesInDataset(RECEIVE_FILES_IN_DATASET, json));
		});
	};
}

export const RECEIVE_DATASET_ABOUT = "RECEIVE_DATASET_ABOUT";

export function receiveDatasetAbout(type, json) {
	return (dispatch) => {
		dispatch({
			type: type,
			about: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchDatasetAbout(id){
	return (dispatch) => {
		return V2.DatasetsService.getDatasetApiV2DatasetsDatasetIdGet(id).catch(reason => {
			if (reason.status === 401){
				console.log("Unauthorized!");
				// logout();
			}
			dispatch(receiveDatasetAbout(RECEIVE_DATASET_ABOUT, []));
		}).then(json => {
			dispatch(receiveDatasetAbout(RECEIVE_DATASET_ABOUT, json));
		});
	};
}

export const RECEIVE_DATASETS = "RECEIVE_DATASETS";

export function receiveDatasets(type, json) {
	return (dispatch) => {
		dispatch({
			type: type,
			datasets: json,
			receivedAt: Date.now(),
		});
	};
}

export function fetchDatasets(when, date, limit=5){
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.DatasetsService.getDatasetsApiV2DatasetsGet(0, limit).catch(reason => {
		    if (reason.status === 401){
				console.log("Unauthorized!");
				// logout();
			}
		    dispatch(receiveDatasets(RECEIVE_DATASETS, []));
		}).then(json => {
			dispatch(receiveDatasets(RECEIVE_DATASETS, json));
		});
	};
}

export const CREATE_DATASET = "CREATE_DATASET";
export function datasetCreated(formData){
	return (dispatch) =>{
		return V2.DatasetsService.saveDatasetApiV2DatasetsPost(formData).catch(reason => {
			if (reason.status === 401) {
				console.error("Failed to create dataset: Not authenticated: ", reason);
				// logout();
			}
			dispatch({
				type: CREATE_DATASET,
				dataset: {},
				receivedAt: Date.now(),
			});
		}).then(dataset => {
			dispatch({
				type: CREATE_DATASET,
				dataset: dataset,
				receivedAt: Date.now(),
			});
		});
	};
}

export const DELETE_DATASET = "DELETE_DATASET";
export function datasetDeleted(datasetId){
	return (dispatch) => {
		return V2.DatasetsService.deleteDatasetApiV2DatasetsDatasetIdDelete(datasetId).catch(reason => {
			if (reason.status === 401){
				console.log("Unauthorized!");
				// logout();
			}
			dispatch({
				type: DELETE_DATASET,
				// FIXME: is this right? Do we need to provide a body here for the failure case?
				dataset: {"id": null, "status": reason["status"] === undefined ? reason["status"] : "fail"},
				receivedAt: Date.now(),
			});
		}).then(json => {
			dispatch({
				type: DELETE_DATASET,
				dataset: {"id": datasetId, "status": json["status"] === undefined ? json["status"] : "success"},
				receivedAt: Date.now(),
			});
		});
	};
}
