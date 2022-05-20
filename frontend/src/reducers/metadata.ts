import {
	POST_DATASET_METADATA,
	RECEIVE_DATASET_METADATA, RECEIVE_METADATA_DEFINITIONS,
	UPDATE_DATASET_METADATA
} from "../actions/metadata";
import {DataAction} from "../types/action";
import {MetadataState} from "../types/data";

const defaultState: MetadataState = {
	datasetMetadataList: [],
	fileMetadata: [],
	metadataDefinitionList: []
};

const metadata = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_METADATA_DEFINITIONS:
			return Object.assign({}, state, {metadataDefinitionList: action.metadataDefinitionList});
		case RECEIVE_DATASET_METADATA:
			return Object.assign({}, state, {datasetMetadataList: action.datasetMetadataList});
		case UPDATE_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: state.datasetMetadataList.map(dm => {
					if (dm.id === action.metadata.id){
						return action.metadata
					}
					return dm
				} ),
			});
		case POST_DATASET_METADATA:
			return Object.assign({}, state, {
				datasetMetadataList: [...state.datasetMetadataList, action.metadata]
			});
		default:
			return state;
	}
};

export default metadata;
