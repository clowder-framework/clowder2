import { DataAction } from "../types/action";
import { VisualizationConfigOut, VisualizationDataOut } from "../openapi/v2";
import { PublicVisualizationState } from "../types/data";
import {
	DOWNLOAD_PUBLIC_VIS_DATA,
	GET_PUBLIC_VIS_CONFIG,
	GET_PUBLIC_VIS_DATA,
	GET_PUBLIC_VIS_DATA_PRESIGNED_URL,
	RESET_PUBLIC_VIS_DATA_PRESIGNED_URL,
} from "../actions/public_visualization";

const defaultState: PublicVisualizationState = {
	publicVisData: <VisualizationDataOut>{},
	publicVisConfig: <VisualizationConfigOut[]>[],
	publicPresignedUrl: "",
	publicBlob: new Blob([]),
};

const publicVisualization = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case GET_PUBLIC_VIS_DATA:
			return Object.assign({}, state, { publicVisData: action.publicVisData });
		case GET_PUBLIC_VIS_CONFIG:
			return Object.assign({}, state, {
				publicVisConfig: action.publicVisConfig,
			});
		case DOWNLOAD_PUBLIC_VIS_DATA:
			return Object.assign({}, state, { publicBlob: action.publicBlob });
		case GET_PUBLIC_VIS_DATA_PRESIGNED_URL:
			return Object.assign({}, state, {
				publicPresignedUrl: action.publicPresignedUrl,
			});
		case RESET_PUBLIC_VIS_DATA_PRESIGNED_URL:
			return Object.assign({}, state, { publicPresignedUrl: "" });
		default:
			return state;
	}
};

export default publicVisualization;
