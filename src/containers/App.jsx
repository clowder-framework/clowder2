import {connect} from "react-redux";
import AppComponent from "../components/App";
import {
	deleteFile,
	fetchFileExtractedMetadata,
	fetchFileMetadataJsonld,
	fetchFilePreviews
} from "../actions/file";

import {
	fetchFilesInDataset,
	fetchDatasetAbout,
	fetchDatasets,
	deleteDataset
} from "../actions/dataset";

const mapStateToProps = (state) => {
	return {
		fileExtractedMetadata: state.file.extractedMetadata,
		fileMetadataJsonld: state.file.metadataJsonld,
		filePreviews: state.file.previews,
		filesInDataset: state.dataset.files,
		datasetAbout: state.dataset.about,
		datasets: state.dataset.datasets,
		status: state.dataset.status,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		listFileExtractedMetadata: (fileId) => {
			dispatch(fetchFileExtractedMetadata(fileId));
		},
		listFileMetadataJsonld: (fileId) => {
			dispatch(fetchFileMetadataJsonld(fileId));
		},
		listFilePreviews: (fileId) => {
			dispatch(fetchFilePreviews(fileId));
		},
		listFilesInDataset: (datasetId) => {
			dispatch(fetchFilesInDataset(datasetId));
		},
		deleteFile: (fileId) => {
			dispatch(deleteFile(fileId));
		},
		listDatasetAbout: (datasetId) => {
			dispatch(fetchDatasetAbout(datasetId));
		},
		listDatasets: (when, date, limit) =>{
			dispatch(fetchDatasets(when, date, limit));
		},
		deleteDataset: (datasetId) => {
			dispatch(deleteDataset(datasetId));
		}
	};
};

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

export default App;
