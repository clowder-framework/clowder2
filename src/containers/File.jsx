import {connect} from "react-redux";
import FileComponent from "../components/File";
import {fetchFileExtractedMetadata, fetchFileMetadata} from "../actions/file";


const mapStateToProps = (state) => {
	return {
		fileMetadata: state.file.metadata,
		fileExtractedMetadata: state.file.extractedMetadata
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		listFileMetadata: (id) => {
			dispatch(fetchFileMetadata(id));
		},
		listFileExtractedMetadata: (id) => {
			dispatch(fetchFileExtractedMetadata(id));
		}
	};
};

const File = connect(mapStateToProps, mapDispatchToProps)(FileComponent);

export default File;
