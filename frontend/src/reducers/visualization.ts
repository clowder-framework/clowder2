import { DataAction } from "../types/action";
import { VisualizationConfigOut, VisualizationOut } from "../openapi/v2";
import { VisualizationState } from "../types/data";
import {
	DOWNLOAD_VIZ_DATA,
	GENERATE_VIZ_URL,
	GET_VIZ_CONFIG,
	GET_VIZ_DATA,
} from "../actions/visualization";

const defaultState: VisualizationState = {
	vizData: <VisualizationOut>{},
	vizConfig: <VisualizationConfigOut>{},
	url: "",
	blob: new Blob([]),
};

const visualization = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case GET_VIZ_DATA:
			return Object.assign({}, state, { vizData: action.vizData });
		case GET_VIZ_CONFIG:
			return Object.assign({}, state, { vizConfig: action.vizConfig });
		case DOWNLOAD_VIZ_DATA:
			return Object.assign({}, state, { blob: action.blob });
		case GENERATE_VIZ_URL:
			return Object.assign({}, state, { url: action.url });
		default:
			return state;
	}
};

export default visualization;
