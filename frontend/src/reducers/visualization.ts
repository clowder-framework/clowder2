import { DataAction } from "../types/action";
import { VisualizationConfigOut, VisualizationDataOut } from "../openapi/v2";
import { VisualizationState } from "../types/data";
import {
	DOWNLOAD_VIS_DATA,
	GET_VIS_CONFIG,
	GET_VIS_DATA,
	GET_VIS_DATA_PRESIGNED_URL,
	RESET_VIS_DATA_PRESIGNED_URL,
} from "../actions/visualization";

const defaultState: VisualizationState = {
	visData: <VisualizationDataOut>{},
	visConfig: <VisualizationConfigOut[]>[],
	presignedUrl: "",
	blob: new Blob([]),
};

const visualization = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case GET_VIS_DATA:
			return Object.assign({}, state, { visData: action.visData });
		case GET_VIS_CONFIG:
			return Object.assign({}, state, { visConfig: action.visConfig });
		case DOWNLOAD_VIS_DATA:
			return Object.assign({}, state, { blob: action.blob });
		case GET_VIS_DATA_PRESIGNED_URL:
			return Object.assign({}, state, { presignedUrl: action.presignedUrl });
		case RESET_VIS_DATA_PRESIGNED_URL:
			return Object.assign({}, state, { presignedUrl: "" });
		default:
			return state;
	}
};

export default visualization;
