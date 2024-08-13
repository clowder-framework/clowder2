import {
	CHANGE_SELECTED_VERSION,
	DOWNLOAD_FILE,
	INCREMENT_FILE_DOWNLOADS,
	RECEIVE_FILE_EXTRACTED_METADATA,
	RECEIVE_FILE_METADATA_JSONLD,
	RECEIVE_FILE_PRESIGNED_URL,
	RECEIVE_FILE_SUMMARY,
	RECEIVE_PREVIEWS,
	RECEIVE_VERSIONS,
	RESET_FILE_PRESIGNED_URL,
} from "../actions/file";
import { DataAction } from "../types/action";
import { FileState } from "../types/data";
import { FileOut as FileSummary } from "../openapi/v2";
import { RECEIVE_FILE_ROLE } from "../actions/authorization";
import { INCREMENT_DATASET_DOWNLOADS } from "../actions/dataset";

const defaultState: FileState = {
	fileSummary: <FileSummary>{},
	extractedMetadata: [],
	metadataJsonld: [],
	previews: [],
	fileVersions: [],
	fileRole: "",
	blob: new Blob([]),
	presignedUrl: "",
	selected_version_num: 1,
};

const file = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_FILE_SUMMARY:
			return Object.assign({}, state, { fileSummary: action.fileSummary });
		case INCREMENT_FILE_DOWNLOADS:
			return Object.assign({}, state, {
				fileSummary: {
					...state.fileSummary,
					downloads: state.fileSummary.downloads + 1,
				},
			});
		case RECEIVE_FILE_ROLE:
			return Object.assign({}, state, { fileRole: action.role });
		case RECEIVE_FILE_EXTRACTED_METADATA:
			return Object.assign({}, state, {
				extractedMetadata: action.extractedMetadata,
			});
		case RECEIVE_FILE_METADATA_JSONLD:
			return Object.assign({}, state, {
				metadataJsonld: action.metadataJsonld,
			});
		case RECEIVE_PREVIEWS:
			return Object.assign({}, state, { previews: action.previews });
		case CHANGE_SELECTED_VERSION:
			return Object.assign({}, state, {
				selected_version_num: action.selected_version,
			});
		case RECEIVE_VERSIONS:
			return Object.assign({}, state, { fileVersions: action.fileVersions });
		case DOWNLOAD_FILE:
			// TODO do nothing for now; but in the future can utilize to display certain effects
			return Object.assign({}, state, { blob: action.blob });
		case RECEIVE_FILE_PRESIGNED_URL:
			return Object.assign({}, state, { presignedUrl: action.presignedUrl });
		case RESET_FILE_PRESIGNED_URL:
			return Object.assign({}, state, { presignedUrl: "" });
		default:
			return state;
	}
};

export default file;
