import { combineReducers } from "redux";
import file from "./file";

const rootReducer = combineReducers({
	file: file
});

export default rootReducer;
