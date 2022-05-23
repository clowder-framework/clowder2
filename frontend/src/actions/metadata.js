import {handleErrors} from "./common";
import {V2} from "../openapi";

export const RECEIVE_METADATA_DEFINITIONS = "RECEIVE_METADATA_DEFINITIONS";
export function fetchMetadataDefinitions(skip=0, limit=10){
	return (dispatch) => {
		// TODO need to think pagination
		return V2.MetadataService.getMetadataDefinitionApiV2MetadataDefinitionGet(null, skip, limit)
			.then(json => {
				dispatch({
					type: RECEIVE_METADATA_DEFINITIONS,
					metadataDefinitionList: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}

export const RECEIVE_DATASET_METADATA = "RECEIVE_DATASET_METADATA";
export function fetchDatasetMetadata(datasetId){
	return (dispatch) => {
		return V2.MetadataService.getDatasetMetadataApiV2DatasetsDatasetIdMetadataGet(datasetId)
			.then(json => {
				dispatch({
					type: RECEIVE_DATASET_METADATA,
					datasetMetadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}

export const POST_DATASET_METADATA = "POST_DATASET_METADATA";
export function postDatasetMetadata(datasetId, metadata){
	return (dispatch) => {
		return V2.MetadataService.addDatasetMetadataApiV2DatasetsDatasetIdMetadataPost(datasetId, metadata)
			.then(json =>{
				dispatch({
					type: POST_DATASET_METADATA,
					newMetadata: json,
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
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason));
			});
	};
}
