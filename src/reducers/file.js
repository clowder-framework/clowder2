import { RECEIVE_FILE_METADATA, RECEIVE_FILE_EXTRACTED_METADATA, RECEIVE_FILE_METADATA_JSONLD } from "../actions/file";

const defaultState = {metadata: {}, extractedMetadata: {}, metadataJsonld: []};

const file = (state=defaultState, action) => {
	switch(action.type) {
		case RECEIVE_FILE_METADATA:
			return Object.assign({}, state, {metadata: action.metadata});
		case RECEIVE_FILE_EXTRACTED_METADATA:
			return Object.assign({}, state, {extractedMetadata: action.extractedMetadata});
		case RECEIVE_FILE_METADATA_JSONLD:
			return Object.assign({}, state, {metadataJsonld: action.metadataJsonld});
		default:
			return state;
	}
};

export default file;
