import {
	DOWNLOAD_FILE,
	GENERATE_FILE_URL,
	RECEIVE_FILE_EXTRACTED_METADATA,
	RECEIVE_FILE_METADATA_JSONLD,
	RECEIVE_FILE_SUMMARY,
	RECEIVE_PREVIEWS,
	RECEIVE_VERSIONS,
} from "../actions/file";
import { DataAction } from "../types/action";
import { ExtractedMetadata, FileState } from "../types/data";
import { AuthorizationBase, FileOut as FileSummary } from "../openapi/v2";
import { RECEIVE_FILE_ROLE } from "../actions/authorization";

const defaultState: FileState = {
	fileSummary: <FileSummary>{},
	extractedMetadata: <ExtractedMetadata>{},
	metadataJsonld: [],
	previews: [],
	fileVersions: [],
	fileRole: <AuthorizationBase>{},
	url: "",
};

const file = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_FILE_SUMMARY:
			return Object.assign({}, state, { fileSummary: action.fileSummary });
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
		case RECEIVE_VERSIONS:
			return Object.assign({}, state, { fileVersions: action.fileVersions });
		case DOWNLOAD_FILE:
			// TODO do nothing for now; but in the future can utilize to display certain effects
			return Object.assign({}, state, {});
		case GENERATE_FILE_URL:
			return Object.assign({}, state, { url: action.url });
		default:
			return state;
	}
};

export default file;
