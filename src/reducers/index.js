import { combineReducers } from "redux";
import file from "./file";
import dataset from "./dataset";

const rootReducer = combineReducers({
	file: file,
	dataset: dataset
});

export default rootReducer;
