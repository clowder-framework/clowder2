import { combineReducers } from "redux";
import file from "./file";
import dataset from "./dataset";
import publicDataset from "./public_dataset";
import publicFile from "./public_file";
import folder from "./folder";
import user from "./user";
import error from "./error";
import metadata from "./metadata";
import listeners from "./listeners";
import group from "./group";
import visualization from "./visualization";
import publicVisualization from "./public_visualization";
import feeds from "./feeds";
import project from "./project";

const rootReducer = combineReducers({
	file: file,
	dataset: dataset,
	project: project,
	publicDataset: publicDataset,
	publicFile: publicFile,
	folder: folder,
	user: user,
	error: error,
	metadata: metadata,
	listener: listeners,
	group: group,
	visualization: visualization,
	publicVisualization: publicVisualization,
	feed: feeds,
});

export default rootReducer;
