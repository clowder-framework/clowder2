import { handleErrors } from "./common";
import { V2 } from "../openapi";

export const RECEIVE_PUBLIC_METADATA_DEFINITIONS =
	"RECEIVE_PUBLIC_METADATA_DEFINITIONS";

export function fetchPublicMetadataDefinitions(name, skip, limit) {
	return (dispatch) => {
		return V2.PublicMetadataService.getMetadataDefinitionListApiV2PublicMetadataDefinitionGet(
			name,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_METADATA_DEFINITIONS,
					publicMetadataDefinitionList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						fetchPublicMetadataDefinitions(name, skip, limit)
					)
				);
			});
	};
}

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

export const SAVE_METADATA_DEFINITION = "SAVE_METADATA_DEFINITION";

export function postMetadataDefinition(metadataDefinition) {
	return (dispatch) => {
		return V2.MetadataService.saveMetadataDefinitionApiV2MetadataDefinitionPost(
			metadataDefinition
		)
			.then((json) => {
				dispatch({
					type: SAVE_METADATA_DEFINITION,
					metadataDefinition: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, postMetadataDefinition(metadataDefinition))
				);
			});
	};
}

export const EDIT_METADATA_DEFINITION = "EDIT_METADATA_DEFINITION";

export function updateMetadataDefinition(id, metadataDefinition) {
	return (dispatch) => {
		return V2.MetadataService.updateMetadataDefinitionApiV2MetadataDefinitionMetadataDefinitionIdPut(
			id,
			metadataDefinition
		)
			.then((json) => {
				dispatch({
					type: EDIT_METADATA_DEFINITION,
					metadataDefinition: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, updateMetadataDefinition(id, metadataDefinition))
				);
			});
	};
}

export const RESET_SAVE_METADATA_DEFINITIONS =
	"RESET_SAVE_METADATA_DEFINITIONS";

export function resetPostMetadataDefinitions() {
	return (dispatch) => {
		dispatch({
			type: RESET_SAVE_METADATA_DEFINITIONS,
			receivedAt: Date.now(),
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
	if (searchTerm.trim() === "") {
		// Search term is empty.
		console.log("Please enter a search term");
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

export function fetchDatasetMetadata(datasetId) {
	return (dispatch) => {
		return V2.MetadataService.getDatasetMetadataApiV2DatasetsDatasetIdMetadataGet(
			datasetId
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_DATASET_METADATA,
					metadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchDatasetMetadata(datasetId)));
			});
	};
}

export const RECEIVE_PUBLIC_DATASET_METADATA =
	"RECEIVE_PUBLIC_DATASET_METADATA";

export function fetchPublicDatasetMetadata(datasetId) {
	return (dispatch) => {
		return V2.PublicDatasetsService.getDatasetMetadataApiV2PublicDatasetsDatasetIdMetadataGet(
			datasetId
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_DATASET_METADATA,
					publicDatasetMetadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchPublicDatasetMetadata(datasetId)));
			});
	};
}

export const RECEIVE_FILE_METADATA = "RECEIVE_FILE_METADATA";

export function fetchFileMetadata(fileId, version) {
	return (dispatch) => {
		return V2.MetadataService.getFileMetadataApiV2FilesFileIdMetadataGet(
			fileId,
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
				dispatch(handleErrors(reason, fetchFileMetadata(fileId, version)));
			});
	};
}

export const RECEIVE_PUBLIC_FILE_METADATA = "RECEIVE_PUBLIC_FILE_METADATA";

export function fetchPublicFileMetadata(fileId, version) {
	return (dispatch) => {
		return V2.PublicFilesService.getFileMetadataApiV2PublicFilesFileIdMetadataGet(
			fileId,
			version,
			false
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_FILE_METADATA,
					publicFileMetadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, fetchPublicFileMetadata(fileId, version))
				);
			});
	};
}

export const POST_DATASET_METADATA = "POST_DATASET_METADATA";

export function postDatasetMetadata(datasetId, metadata) {
	return (dispatch) => {
		return V2.MetadataService.addDatasetMetadataApiV2DatasetsDatasetIdMetadataPost(
			datasetId,
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
					handleErrors(reason, postDatasetMetadata(datasetId, metadata))
				);
			});
	};
}

export const POST_FILE_METADATA = "POST_FILE_METADATA";

export function postFileMetadata(fileId, metadata) {
	return (dispatch) => {
		return V2.MetadataService.addFileMetadataApiV2FilesFileIdMetadataPost(
			fileId,
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
				dispatch(handleErrors(reason, postFileMetadata(fileId, metadata)));
			});
	};
}

export const DELETE_DATASET_METADATA = "DELETE_DATASET_METADATA";

export function deleteDatasetMetadata(datasetId, metadata) {
	return (dispatch) => {
		return V2.MetadataService.deleteDatasetMetadataApiV2DatasetsDatasetIdMetadataDelete(
			datasetId,
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
					handleErrors(reason, deleteDatasetMetadata(datasetId, metadata))
				);
			});
	};
}

export const DELETE_FILE_METADATA = "DELETE_FILE_METADATA";

export function deleteFileMetadata(fileId, metadata) {
	return (dispatch) => {
		return V2.MetadataService.deleteFileMetadataApiV2FilesFileIdMetadataDelete(
			fileId,
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
				dispatch(handleErrors(reason, deleteFileMetadata(fileId, metadata)));
			});
	};
}

export const UPDATE_DATASET_METADATA = "UPDATE_DATASET_METADATA";

export function patchDatasetMetadata(datasetId, metadata) {
	return (dispatch) => {
		return V2.MetadataService.updateDatasetMetadataApiV2DatasetsDatasetIdMetadataPatch(
			datasetId,
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
					handleErrors(reason, patchDatasetMetadata(datasetId, metadata))
				);
			});
	};
}

export const UPDATE_FILE_METADATA = "UPDATE_FILE_METADATA";

export function patchFileMetadata(fileId, metadata) {
	return (dispatch) => {
		return V2.MetadataService.updateFileMetadataApiV2FilesFileIdMetadataPatch(
			fileId,
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
				dispatch(handleErrors(reason, patchFileMetadata(fileId, metadata)));
			});
	};
}
