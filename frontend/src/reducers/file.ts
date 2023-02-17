import {
	RECEIVE_FILE_EXTRACTED_METADATA,
	RECEIVE_FILE_SUMMARY,
	RECEIVE_FILE_METADATA_JSONLD,
	RECEIVE_PREVIEWS,
	RECEIVE_VERSIONS,
	DOWNLOAD_FILE
} from "../actions/file";
import {DataAction} from "../types/action";
import {FileState, ExtractedMetadata} from "../types/data";
import {FileOut as FileSummary} from "../openapi/v2";

const defaultState: FileState = {
	fileSummary: <FileSummary>{},
	extractedMetadata: <ExtractedMetadata>{},
	metadataJsonld: [],
	previews: [],
	fileVersions: [],
};

const file = (state=defaultState, action: DataAction) => {
	switch(action.type) {
	case RECEIVE_FILE_SUMMARY:
		return Object.assign({}, state, {fileSummary: action.fileSummary});
	case RECEIVE_FILE_EXTRACTED_METADATA:
		return Object.assign({}, state, {extractedMetadata: action.extractedMetadata});
	case RECEIVE_FILE_METADATA_JSONLD:
		return Object.assign({}, state, {metadataJsonld: action.metadataJsonld});
	case RECEIVE_PREVIEWS:
		return Object.assign({}, state, {previews: action.previews});
	case RECEIVE_VERSIONS:
		return Object.assign({}, state, {fileVersions: action.fileVersions});
	case DOWNLOAD_FILE:
		// TODO do nothing for now; but in the future can utilize to display certain effects
		return Object.assign({}, state, {});
	default:
		return state;
	}
};

export default file;
