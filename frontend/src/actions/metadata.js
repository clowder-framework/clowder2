import {handleErrors} from "./common";
import {V2} from "../openapi";

export const FAILED = "FAILED";
export const RECEIVE_DATASET_METADATA = "RECEIVE_DATASET_METADATA";
export function fetchDatasetMetadata(datasetId){
	return (dispatch) => {
		return V2.MetadataService.getDatasetMetadataApiV2DatasetsDatasetIdMetadataGet(datasetId)
			.then(json => {
				dispatch({
					type: RECEIVE_DATASET_METADATA,
					datasetMetadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}

export const UPDATE_DATASET_METADATA = "UPDATE_DATASET_METADATA";
export function patchDatasetMetadata(datasetId, metadata){
	return (dispatch) => {
		return V2.MetadataService.updateDatasetMetadataApiV2DatasetsDatasetIdMetadataPatch(datasetId, metadata)
			.then(json => {
				dispatch({
					type: UPDATE_DATASET_METADATA,
					updatedMetadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}
