import { combineReducers } from "redux";
import file from "./file";
import dataset from "./dataset";
import publicDataset from "./public_dataset";
import folder from "./folder";
import user from "./user";
import error from "./error";
import metadata from "./metadata";
import listeners from "./listeners";
import group from "./group";
import visualization from "./visualization";

const rootReducer = combineReducers({
	file: file,
	dataset: dataset,
	publicDataset: publicDataset,
	folder: folder,
	user: user,
	error: error,
	metadata: metadata,
	listener: listeners,
	group: group,
	visualization: visualization,
});

export default rootReducer;
