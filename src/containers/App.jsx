import {connect} from "react-redux";
import AppComponent from "../components/App";
import {
	fetchFileExtractedMetadata,
	fetchFileMetadata,
	fetchFileMetadataJsonld,
	fetchFilePreviews
} from "../actions/file";

import {
	fetchFilesInDataset,
	fetchDatasetAbout
} from "../actions/dataset";

const mapStateToProps = (state) => {
	return {
		fileExtractedMetadata: state.file.extractedMetadata,
		fileMetadataJsonld: state.file.metadataJsonld,
		filePreviews: state.file.previews,
		filesInDataset: state.dataset.files,
		datasetAbout: state.dataset.about
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
		listDatasetAbout: (datasetId) => {
			dispatch(fetchDatasetAbout(datasetId));
		}
	};
};

const App = connect(mapStateToProps, mapDispatchToProps)(AppComponent);

export default App;
