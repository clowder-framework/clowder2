import {
    DOWNLOAD_PUBLIC_FILE,
    RECEIVE_PUBLIC_FILE_EXTRACTED_METADATA,
    RECEIVE_PUBLIC_FILE_METADATA_JSONLD,
    RECEIVE_PUBLIC_FILE_SUMMARY,
    RECEIVE_PUBLIC_PREVIEWS,
    RECEIVE_PUBLIC_VERSIONS,
    CHANGE_PUBLIC_SELECTED_VERSION, RECEIVE_PUBLIC_FILE_METADATA_JSONLD,
} from "../actions/public_file";
import { DataAction } from "../types/action";
import {FileOut as FileSummary } from "../openapi/v2";
import { PublicFileState } from "../types/data";

const defaultState: PublicFileState = {
	publicFileSummary: <FileSummary>{},
	publicExtractedMetadata: [],
	publicMetadataJsonld: [],
	publicPreviews: [],
	publicFileVersions: [],
	publicBlob: new Blob([]),
	publicSelected_version_num:1,
};

const publicFile = (state = defaultState, action: DataAction) => {
	switch (action.type) {
		case RECEIVE_PUBLIC_FILE_SUMMARY:
			return Object.assign({}, state, { fileSummary: action.publicFileSummary });
		case RECEIVE_PUBLIC_FILE_EXTRACTED_METADATA:
			return Object.assign({}, state, {
				publicExtractedMetadata: action.publicExtractedMetadata,
			});
		case RECEIVE_PUBLIC_FILE_METADATA_JSONLD:
			return Object.assign({}, state, {
				publicMetadataJsonld: action.publicMetadataJsonld,
			});
		case RECEIVE_PUBLIC_PREVIEWS:
			return Object.assign({}, state, { publicPreviews: action.publicPreviews });
		case CHANGE_PUBLIC_SELECTED_VERSION:
			return Object.assign({}, state,{publicSelected_version_num:action.publicSelected_version});
		case RECEIVE_PUBLIC_VERSIONS:
			return Object.assign({}, state, { publicFileVersions: action.publicFileVersions });
		case DOWNLOAD_PUBLIC_FILE:
			// TODO do nothing for now; but in the future can utilize to display certain effects
			return Object.assign({}, state, { publicBlob: action.publicBlob });
		default:
			return state;
	}
};

export default publicFile;
