import { combineReducers } from "redux";
import file from "./file";
import dataset from "./dataset";
import user from "./user";

const rootReducer = combineReducers({
	file: file,
	dataset: dataset,
	user: user,
});

export default rootReducer;
