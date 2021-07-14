import { RECEIVE_FILE_METADATA, RECEIVE_FILE_EXTRACTED_METADATA } from "../actions/file";

const defaultState = {file: []};

const file = (state=defaultState, action) => {
	switch(action.type) {
		case RECEIVE_FILE_METADATA:
			return Object.assign({}, state, {metadata: action.metadata});
		case RECEIVE_FILE_EXTRACTED_METADATA:
			return Object.assign({}, state, {extractedMetadata: action.extractedMetadata});
		default:
			return state;
	}
};

export default file;
