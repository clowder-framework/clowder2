import {
	RECEIVE_DATASET_METADATA,
	UPDATE_DATASET_METADATA
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
		case UPDATE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadata: state.datasetMetadata.map(dm => {
					if (dm.id === action.updatedMetadata.id){
						return action.updatedMetadata
					}
					return dm
				} ),
			});
		default:
			return state;
	}
};

export default metadata;
