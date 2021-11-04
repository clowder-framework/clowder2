import { RECEIVE_FILE_EXTRACTED_METADATA, RECEIVE_FILE_METADATA_JSONLD, RECEIVE_PREVIEWS } from "../actions/file";

const defaultState = {metadata: {}, extractedMetadata: {}, metadataJsonld: [], previews: []};

const file = (state=defaultState, action) => {
	switch(action.type) {
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
