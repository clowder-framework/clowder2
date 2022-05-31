import {handleErrors} from "./common";
import {V2} from "../openapi";

export const RECEIVE_METADATA_DEFINITIONS = "RECEIVE_METADATA_DEFINITIONS";
export function fetchMetadataDefinitions(name=null, skip=0, limit=10){
	return (dispatch) => {
		// TODO need to think pagination
		return V2.MetadataService.getMetadataDefinitionApiV2MetadataDefinitionGet(name, skip, limit)
			.then(json => {
				dispatch({
					type: RECEIVE_METADATA_DEFINITIONS,
					metadataDefinitionList: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchMetadataDefinitions(name, skip, limit)));
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
					metadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchDatasetMetadata(datasetId)));
			});
	};
}

export const RECEIVE_FILE_METADATA = "RECEIVE_FILE_METADATA";
export function fetchFileMetadata(fileId){
	return (dispatch) => {
		return V2.MetadataService.getFileMetadataApiV2FilesFileIdMetadataGet(fileId)
			.then(json => {
				dispatch({
					type: RECEIVE_FILE_METADATA,
					metadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, fetchFileMetadata(fileId)));
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
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, postDatasetMetadata(datasetId, metadata)));
			});
	};
}

export const POST_FILE_METADATA = "POST_FILE_METADATA";
export function postFileMetadata(fileId, metadata){
	return (dispatch) => {
		return V2.MetadataService.addFileMetadataApiV2FilesFileIdMetadataPost(fileId, metadata)
			.then(json =>{
				dispatch({
					type: POST_FILE_METADATA,
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, postFileMetadata(fileId, metadata)));
			});
	};
}

// export const DELETE_DATASET_METADATA = "DELETE_DATASET_METADATA";
// export function deleteDatasetMetadata(datasetId, metadataId){
// 	return (dispatch) =>{
// 		return V2.MetadataService.deleteDatasetMetadataApiV2DatasetsDatasetIdMetadataDelete()
// 	}
// }

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
				dispatch(handleErrors(reason, patchDatasetMetadata(datasetId, metadata)));
			});
	};
}

export const UPDATE_FILE_METADATA = "UPDATE_FILE_METADATA";
export function patchFileMetadata(fileId, metadata){
	return (dispatch) => {
		return V2.MetadataService.updateFileMetadataApiV2FilesFileIdMetadataPatch(fileId, metadata)
			.then(json => {
				dispatch({
					type: UPDATE_FILE_METADATA,
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch(reason => {
				dispatch(handleErrors(reason, patchFileMetadata(fileId, metadata)));
			});
	};
}
