import {connect} from "react-redux";
import FileComponent from "../components/File";
import {fetchFileMetadata} from "../actions/file";


const mapStateToProps = (state) => {
	return {
		fileMetadata: state.file.file
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		listFileMetadata: (id) => {
			dispatch(fetchFileMetadata(id));
		}
	};
};

const File = connect(mapStateToProps, mapDispatchToProps)(FileComponent);

export default File;
