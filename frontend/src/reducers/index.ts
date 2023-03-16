import { combineReducers } from "redux";
import file from "./file";
import dataset from "./dataset";
import folder from "./folder";
import user from "./user";
import error from "./error";
import metadata from "./metadata";
import listeners from "./listeners";
import groups from "./groups";

const rootReducer = combineReducers({
	file: file,
	dataset: dataset,
	folder: folder,
	user: user,
	error: error,
	metadata: metadata,
	listener: listeners,
	group: groups,
});

export default rootReducer;
