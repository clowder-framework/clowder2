import {
	DOWNLOAD_PUBLIC_FILE,
	RECEIVE_PUBLIC_FILE_SUMMARY,
	RECEIVE_PUBLIC_PREVIEWS,
	RECEIVE_PUBLIC_VERSIONS,
	CHANGE_PUBLIC_SELECTED_VERSION,
	INCREMENT_PUBLIC_FILE_DOWNLOADS,
} from "../actions/public_file";
import { DataAction } from "../types/action";
import { FileOut as FileSummary } from "../openapi/v2";
import { PublicFileState } from "../types/data";

const defaultState: PublicFileState = {
	publicFileSummary: <FileSummary>{},
	publicExtractedMetadata: [],
	publicMetadataJsonld: [],
	publicPreviews: [],
	publicFileVersions: [],
	publicBlob: new Blob([]),
	publicSelected_version_num: 1,
};

const publicFile = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_PUBLIC_FILE_SUMMARY:
			return Object.assign({}, state, {
				publicFileSummary: action.publicFileSummary,
			});
		case INCREMENT_PUBLIC_FILE_DOWNLOADS:
			return Object.assign({}, state, {
				publicFileSummary: {
					...state.publicFileSummary,
					downloads: state.publicFileSummary.downloads + 1,
				},
			});
		case RECEIVE_PUBLIC_PREVIEWS:
			return Object.assign({}, state, {
				publicPreviews: action.publicPreviews,
			});
		case CHANGE_PUBLIC_SELECTED_VERSION:
			return Object.assign({}, state, {
				publicSelected_version_num: action.publicSelected_version_num,
			});
		case RECEIVE_PUBLIC_VERSIONS:
			return Object.assign({}, state, {
				publicFileVersions: action.publicFileVersions,
			});
		case DOWNLOAD_PUBLIC_FILE:
			// TODO do nothing for now; but in the future can utilize to display certain effects
			return Object.assign({}, state, { publicBlob: action.publicBlob });
		default:
			return state;
	}
};

export default publicFile;
