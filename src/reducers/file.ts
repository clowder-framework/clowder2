import {
	RECEIVE_FILE_EXTRACTED_METADATA,
	RECEIVE_FILE_METADATA,
	RECEIVE_FILE_METADATA_JSONLD,
	RECEIVE_PREVIEWS,
	FAILED
} from "../actions/file";
import {RESET_FAILED} from "../actions/common";
import {DataAction} from "../types/action";
import {FileState, ExtractedMetadata, FileMetadata} from "../types/data";

const defaultState: FileState = {
	fileMetadata: <FileMetadata>{},
	extractedMetadata: <ExtractedMetadata>{},
	metadataJsonld: [],
	previews: [],
	reason: ""
};

const file = (state=defaultState, action: DataAction) => {
	switch(action.type) {
	case FAILED:
		return Object.assign({}, state, {reason:action.reason});
	case RESET_FAILED:
		return Object.assign({}, state, {reason: action.reason})
	case RECEIVE_FILE_METADATA:
		return Object.assign({}, state, {fileMetadata: action.fileMetadata});
	case RECEIVE_FILE_EXTRACTED_METADATA:
		return Object.assign({}, state, {extractedMetadata: action.extractedMetadata});
	case RECEIVE_FILE_METADATA_JSONLD:
		return Object.assign({}, state, {metadataJsonld: action.metadataJsonld});
	case RECEIVE_PREVIEWS:
		return Object.assign({}, state, {previews: action.previews});
	default:
		return state;
	}
};

export default file;
