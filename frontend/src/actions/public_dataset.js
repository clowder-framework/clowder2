import { V2 } from "../openapi";
import {
	handleErrors,
	handleErrorsAuthorization,
	resetFailedReason,
} from "./common";

export const RECEIVE_PUBLIC_DATASET_METADATA =
	"RECEIVE_PUBLIC_DATASET_METADATA";

export function fetchPublicDatasetMetadata(datasetId, version) {
	return (dispatch) => {
		return V2.PublicDatasetsService.getDatasetMetadataApiV2PublicDatasetsDatasetIdMetadataGet(
			datasetId,
			version,
			false
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_DATASET_METADATA,
					publicDatasetMetadataList: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(reason, fetchPublicDatasetMetadata(datasetId, version))
				);
			});
	};
}

export const RECEIVE_FILES_IN_PUBLIC_DATASET =
	"RECEIVE_FILES_IN_PUBLIC_DATASET";

export function fetchFilesInPublicDataset(datasetId, folderId, skip, limit) {
	return (dispatch) => {
		return V2.PublicDatasetsService.getDatasetFilesApiV2PublicDatasetsDatasetIdFilesGet(
			datasetId,
			folderId,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_FILES_IN_PUBLIC_DATASET,
					publicFiles: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						fetchFilesInPublicDataset(datasetId, folderId, skip, limit)
					)
				);
			});
	};
}

export const RECEIVE_FOLDERS_IN_PUBLIC_DATASET =
	"RECEIVE_FOLDERS_IN_PUBLIC_DATASET";

export function fetchFoldersInPublicDataset(
	datasetId,
	parentFolder,
	skip,
	limit
) {
	return (dispatch) => {
		return V2.PublicDatasetsService.getDatasetFoldersApiV2PublicDatasetsDatasetIdFoldersGet(
			datasetId,
			parentFolder,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_FOLDERS_IN_PUBLIC_DATASET,
					publicFolders: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						fetchFoldersInPublicDataset(datasetId, parentFolder, skip, limit)
					)
				);
			});
	};
}

export const RECEIVE_PUBLIC_DATASET_ABOUT = "RECEIVE_PUBLIC_DATASET_ABOUT";

export function fetchPublicDatasetAbout(id) {
	return (dispatch) => {
		return V2.PublicDatasetsService.getDatasetApiV2PublicDatasetsDatasetIdGet(
			id
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_DATASET_ABOUT,
					publicAbout: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchPublicDatasetAbout(id)));
			});
	};
}

export const RECEIVE_PUBLIC_DATASETS = "RECEIVE_PUBLIC_DATASETS";

export function fetchPublicDatasets(skip = 0, limit = 21) {
	return (dispatch) => {
		// TODO: Parameters for dates? paging?
		return V2.PublicDatasetsService.getDatasetsApiV2PublicDatasetsGet(
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_DATASETS,
					publicDatasets: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(handleErrors(reason, fetchPublicDatasets(skip, limit)));
			});
	};
}

export const GET_PUBLIC_FOLDER_PATH = "GET_PUBLIC_FOLDER_PATH";

export function fetchPublicFolderPath(folderId) {
	return (dispatch) => {
		if (folderId != null) {
			return V2.PublicFoldersService.downloadFolderApiV2PublicFoldersFolderIdPathGet(
				folderId
			)
				.then((json) => {
					dispatch({
						type: GET_PUBLIC_FOLDER_PATH,
						publicFolderPath: json,
						receivedAt: Date.now(),
					});
				})
				.catch((reason) => {
					dispatch(handleErrors(reason, fetchPublicFolderPath(folderId)));
				});
		} else {
			dispatch({
				type: GET_PUBLIC_FOLDER_PATH,
				publicFolderPath: [],
				receivedAt: Date.now(),
			});
		}
	};
}

export const RECEIVE_PUBLIC_FOLDERS_FILES_IN_DATASET =
	"RECEIVE_PUBLIC_FOLDERS_FILES_IN_DATASET";

export function fetchPublicFoldersFilesInDataset(
	datasetId,
	folderId,
	skip,
	limit
) {
	return (dispatch) => {
		return V2.PublicDatasetsService.getDatasetFoldersAndFilesApiV2PublicDatasetsDatasetIdFoldersAndFilesGet(
			datasetId,
			folderId,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: RECEIVE_PUBLIC_FOLDERS_FILES_IN_DATASET,
					publicFoldersAndFiles: json,
					receivedAt: Date.now(),
				});
			})
			.catch((reason) => {
				dispatch(
					handleErrors(
						reason,
						fetchPublicFoldersFilesInDataset(datasetId, folderId, skip, limit)
					)
				);
			});
	};
}

export const GET_PUBLIC_FREEZE_DATASETS = "GET_PUBLIC_FREEZE_DATASETS";

export function getPublicFreezeDatasets(datasetId, skip, limit) {
	return (dispatch) => {
		return V2.PublicDatasetsService.getFreezeDatasetsApiV2PublicDatasetsDatasetIdFreezeGet(
			datasetId,
			skip,
			limit
		)
			.then((json) => {
				dispatch({
					type: GET_PUBLIC_FREEZE_DATASETS,
					publicFrozenDatasets: json,
					receivedAt: Date.now(),
				});
			})
			.then(() => {
				dispatch(resetFailedReason());
			})
			.catch((reason) => {
				dispatch(
					handleErrorsAuthorization(
						reason,
						getPublicFreezeDatasets(datasetId, skip, limit)
					)
				);
			});
	};
}

export const INCREMENT_PUBLIC_DATASET_DOWNLOADS =
	"INCREMENT_PUBLIC_DATASET_DOWNLOADS";
