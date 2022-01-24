import {V2} from "../openapi";

export const FAILED = "FAILED";

export const RECEIVE_FILES_IN_DATASET = "RECEIVE_FILES_IN_DATASET";

export function receiveFilesInDataset(type, json, reason="") {
	return (dispatch) => {
		dispatch({
			type: type,
			files: json,
			reason: reason,
			receivedAt: Date.now(),
		});
	};
}

export function fetchFilesInDataset(id){
	return (dispatch) => {
		return V2.DatasetsService.getDatasetFilesApiV2DatasetsDatasetIdFilesGet(id)
			.then(json => {
				dispatch(receiveFilesInDataset(RECEIVE_FILES_IN_DATASET, json));
			})
			.catch(reason => {
				if (reason.status === 401){
					console.log("Unauthorized!");
				// logout();
				}
				dispatch(receiveFilesInDataset(FAILED, [], `Cannot list files in dataset! ${reason}`));
			})	;
	};
}

export const RECEIVE_DATASET_ABOUT = "RECEIVE_DATASET_ABOUT";

export function receiveDatasetAbout(type, json, reason="") {
	return (dispatch) => {
		dispatch({
			type: type,
			about: json,
			reason: reason,
			receivedAt: Date.now(),
		});
	};
}

export function fetchDatasetAbout(id){
	return (dispatch) => {
		return V2.DatasetsService.getDatasetApiV2DatasetsDatasetIdGet(id)
			.then(json => {
				dispatch(receiveDatasetAbout(RECEIVE_DATASET_ABOUT, json));
			})
			.catch(reason => {
				if (reason.status === 401) {
					console.log("Unauthorized!");
				// logout();
				}
				dispatch(receiveDatasetAbout(FAILED, [], `Cannot fetch Dataset! ${reason}`));
			});
	};
}

export const RECEIVE_DATASETS = "RECEIVE_DATASETS";

export function receiveDatasets(type, json, reason="") {
	return (dispatch) => {
		dispatch({
			type: type,
			datasets: json,
			reason: reason,
			receivedAt: Date.now(),
		});
	};
}

export function fetchDatasets(when, date, limit=5){
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.DatasetsService.getDatasetsApiV2DatasetsGet(0, limit)
			.then(json => {
				dispatch(receiveDatasets(RECEIVE_DATASETS, json));
			})
			.catch(reason => {
				if (reason.status === 401) {
					console.log("Unauthorized!");
				// logout();
				}
				dispatch(receiveDatasets(FAILED, [], `Cannot fetch dataset! ${reason}`));
			});

	};
}

export const CREATE_DATASET = "CREATE_DATASET";
export function datasetCreated(formData){
	return (dispatch) =>{
		return V2.DatasetsService.saveDatasetApiV2DatasetsPost(formData).then(dataset => {
			dispatch({
				type: CREATE_DATASET,
				dataset: dataset,
				reason: "",
				receivedAt: Date.now(),
			});
		})
			.catch(reason => {
				if (reason.status === 401) {
					console.error("Failed to create dataset: Not authenticated: ", reason);
				// logout();
				}
				dispatch({
					type: FAILED,
					dataset: {},
					reason:`Cannot create dataset! ${reason}`,
					receivedAt: Date.now(),
				});
			});
	};
}

export const DELETE_DATASET = "DELETE_DATASET";
export function datasetDeleted(datasetId){
	return (dispatch) => {
		return V2.DatasetsService.deleteDatasetApiV2DatasetsDatasetIdDelete(datasetId)
			.then(json => {
				dispatch({
					type: DELETE_DATASET,
					dataset: {"id": datasetId},
					reason:"",
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
					// FIXME: is this right? Do we need to provide a body here for the failure case?
					dataset: {"id": null},
					reason: `Cannot delete dataset! ${reason}`,
					receivedAt: Date.now(),
				});
			});
	};
}
