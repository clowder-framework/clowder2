import { combineReducers } from "redux";
import file from "./file";
import dataset from "./dataset";
import user from "./user";
import error from "./error";

const rootReducer = combineReducers({
	file: file,
	dataset: dataset,
	user: user,
	error: error
});

export default rootReducer;
