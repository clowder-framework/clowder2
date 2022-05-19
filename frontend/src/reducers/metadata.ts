import {
	RECEIVE_DATASET_METADATA
} from "../actions/metadata";
import {DataAction} from "../types/action";
import {MetadataState} from "../types/data";

const defaultState: MetadataState = {
	datasetMetadata: [],
	fileMetadata: []
};

const metadata = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_DATASET_METADATA:
			return Object.assign({}, state, {datasetMetadata: action.datasetMetadata});
		default:
			return state;
	}
};

export default metadata;
