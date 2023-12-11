import { handleErrors } from "./common";
import { V2 } from "../openapi";

export const RECEIVE_METADATA_DEFINITIONS = "RECEIVE_METADATA_DEFINITIONS";

export function fetchMetadataDefinitions(name, skip, limit) {
	return (dispatch) => {
		return V2.MetadataService.getMetadataDefinitionListApiV2MetadataDefinitionGet(
			name,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_METADATA_DEFINITIONS,
					metadataDefinitionList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, fetchMetadataDefinitions(name, skip, limit))
				);
			});
	};
}

export const RECEIVE_METADATA_DEFINITION = "RECEIVE_METADATA_DEFINITION";

export function fetchMetadataDefinition(metadataDefinitionId) {
	return (dispatch) => {
		return V2.MetadataService.getMetadataDefinitionApiV2MetadataDefinitionMetadataDefinitionIdGet(
			metadataDefinitionId
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_METADATA_DEFINITION,
					metadataDefinition: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, fetchMetadataDefinition(metadataDefinitionId))
				);
			});
	};
}

export const SAVE_METADATA_DEFINITIONS = "SAVE_METADATA_DEFINITIONS";

export function postMetadataDefinitions(metadataDefinition) {
	return (dispatch) => {
		return V2.MetadataService.saveMetadataDefinitionApiV2MetadataDefinitionPost(
			metadataDefinition
		)
			.then((json) => {
				dispatch({
					type: SAVE_METADATA_DEFINITIONS,
					metadataDefinitionList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, postMetadataDefinitions(metadataDefinition))
				);
			});
	};
}

export const DELETE_METADATA_DEFINITION = "DELETE_METADATA_DEFINITION";

export function deleteMetadataDefinition(metadataDefinitionId) {
	return (dispatch) => {
		return V2.MetadataService.deleteMetadataDefinitionApiV2MetadataDefinitionMetadataDefinitionIdDelete(
			metadataDefinitionId
		)
			.then((json) => {
				dispatch({
					type: DELETE_METADATA_DEFINITION,
					metadataDefinition: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, deleteMetadataDefinition(metadataDefinitionId))
				);
			});
	};
}

export const SEARCH_METADATA_DEFINITIONS = "SEARCH_METADATA_DEFINITIONS";

export function searchMetadataDefinitions(searchTerm, skip, limit) {
	if (searchTerm.trim() === '') {
      // Search term is empty.
      console.log('Please enter a search term');
      return;
    }
	return (dispatch) => {
		return V2.MetadataService.searchMetadataDefinitionApiV2MetadataDefinitionSearchSearchTermGet(
			searchTerm,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: SEARCH_METADATA_DEFINITIONS,
					metadataDefinitionList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						searchMetadataDefinitions(searchTerm, skip, limit)
					)
				);
			});
	};
}

export const RECEIVE_DATASET_METADATA = "RECEIVE_DATASET_METADATA";

export function fetchDatasetMetadata(datasetId, adminMode) {
	return (dispatch) => {
		return V2.MetadataService.getDatasetMetadataApiV2DatasetsDatasetIdMetadataGet(
			datasetId,
			adminMode
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_DATASET_METADATA,
					metadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchDatasetMetadata(datasetId, adminMode)));
			});
	};
}

export const RECEIVE_FILE_METADATA = "RECEIVE_FILE_METADATA";

export function fetchFileMetadata(fileId, adminMode, version) {
	return (dispatch) => {
		return V2.MetadataService.getFileMetadataApiV2FilesFileIdMetadataGet(
			fileId,
			adminMode,
			version,
			false
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_FILE_METADATA,
					metadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchFileMetadata(fileId, adminMode, version)));
			});
	};
}

export const POST_DATASET_METADATA = "POST_DATASET_METADATA";

export function postDatasetMetadata(datasetId, adminMode, metadata) {
	return (dispatch) => {
		return V2.MetadataService.addDatasetMetadataApiV2DatasetsDatasetIdMetadataPost(
			datasetId,
			adminMode,
			metadata
		)
			.then((json) => {
				dispatch({
					type: POST_DATASET_METADATA,
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, postDatasetMetadata(datasetId, adminMode, metadata))
				);
			});
	};
}

export const POST_FILE_METADATA = "POST_FILE_METADATA";

export function postFileMetadata(fileId, adminMode, metadata) {
	return (dispatch) => {
		return V2.MetadataService.addFileMetadataApiV2FilesFileIdMetadataPost(
			fileId,
			adminMode,
			metadata
		)
			.then((json) => {
				dispatch({
					type: POST_FILE_METADATA,
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, postFileMetadata(fileId, adminMode, metadata)));
			});
	};
}

export const DELETE_DATASET_METADATA = "DELETE_DATASET_METADATA";

export function deleteDatasetMetadata(datasetId, adminMode, metadata) {
	return (dispatch) => {
		return V2.MetadataService.deleteDatasetMetadataApiV2DatasetsDatasetIdMetadataDelete(
			datasetId,
			adminMode,
			metadata
		)
			.then((json) => {
				dispatch({
					type: DELETE_DATASET_METADATA,
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, deleteDatasetMetadata(datasetId, adminMode, metadata))
				);
			});
	};
}

export const DELETE_FILE_METADATA = "DELETE_FILE_METADATA";

export function deleteFileMetadata(fileId, adminMode, metadata) {
	return (dispatch) => {
		return V2.MetadataService.deleteFileMetadataApiV2FilesFileIdMetadataDelete(
			fileId,
			adminMode,
			metadata
		)
			.then((json) => {
				dispatch({
					type: DELETE_FILE_METADATA,
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, deleteFileMetadata(fileId, adminMode, metadata)));
			});
	};
}

export const UPDATE_DATASET_METADATA = "UPDATE_DATASET_METADATA";

export function patchDatasetMetadata(datasetId, adminMode, metadata) {
	return (dispatch) => {
		return V2.MetadataService.updateDatasetMetadataApiV2DatasetsDatasetIdMetadataPatch(
			datasetId,
			adminMode,
			metadata
		)
			.then((json) => {
				dispatch({
					type: UPDATE_DATASET_METADATA,
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, patchDatasetMetadata(datasetId, adminMode, metadata))
				);
			});
	};
}

export const UPDATE_FILE_METADATA = "UPDATE_FILE_METADATA";

export function patchFileMetadata(fileId, adminMode, metadata) {
	return (dispatch) => {
		return V2.MetadataService.updateFileMetadataApiV2FilesFileIdMetadataPatch(
			fileId,
			adminMode,
			metadata
		)
			.then((json) => {
				dispatch({
					type: UPDATE_FILE_METADATA,
					metadata: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, patchFileMetadata(fileId, adminMode, metadata)));
			});
	};
}
