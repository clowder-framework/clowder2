import * as React from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Paper from '@mui/material/Paper';
import {useSelector} from "react-redux";
import {RootState} from "../../types/data";
import {useNavigate} from "react-router-dom";
import {Button} from "@mui/material";
import FileMenu from "./FileMenu";
import FolderIcon from '@mui/icons-material/Folder';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import {parseDate} from "../../utils/common";
import {VersionChip} from "../versions/VersionChip";
import theme from "../../theme";

type FilesTableProps = {
	datasetId: string | undefined,
	datasetName: string
}

const iconStyle = {
	"vertical-align": "middle",
	color: theme.palette.primary.main
}

export default function FilesTable(props: FilesTableProps) {
	// mapStateToProps
	const filesInDataset = useSelector((state:RootState) => state.dataset.files);
	const foldersInDataset = useSelector((state:RootState) => state.dataset.folders);
	// use history hook to redirect/navigate between routes
	const history = useNavigate();
	const selectFile = (selectedFileId: string | undefined) => {
		// Redirect to file route with file Id and dataset id
		history(`/files/${selectedFileId}?dataset=${props.datasetId}&name=${props.datasetName}`);
	};
	const selectFolder = (selectedFolderId: string) => {
		// Redirect to file route with file Id and dataset id
		history(`/datasets/${props.datasetId}?folder=${selectedFolderId}`);
	};
	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell align="right">Updated</TableCell>
						<TableCell align="right">Size</TableCell>
						<TableCell align="right">Type</TableCell>
						<TableCell align="right"></TableCell>
					</TableRow>
				</TableHead>
				<TableBody>
					{
						foldersInDataset.map((folder) => (
							<TableRow
								key={folder.id}
								sx={{'&:last-child td, &:last-child th': {border: 0}}}
							>
								<TableCell component="th" scope="row">
									<FolderIcon color="primary" sx={iconStyle}/>
									<Button onClick={() => selectFolder(folder.id)}>{folder.name}</Button>
								</TableCell>
								<TableCell align="right">by {folder.author.first_name} {folder.author.last_name}</TableCell>
								<TableCell align="right">&nbsp;</TableCell>
								<TableCell align="right">&nbsp;</TableCell>
								<TableCell align="right">&nbsp;</TableCell>
							</TableRow>))
					}
					{
						filesInDataset.map((file) => (
						<TableRow
							key={file.id}
							sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
						>
							<TableCell component="th" scope="row">
								<InsertDriveFileIcon color="primary" sx={iconStyle}/>
								<Button onClick={() => selectFile(file.id)}>{file.name}</Button>
								{/*TODO this should be version number; for now put version ID instead*/}
								<VersionChip versionNumber={file.version_num}/>
							</TableCell>
							<TableCell align="right">{parseDate(file.created)} by {file.creator.first_name} {file.creator.last_name}</TableCell>
							<TableCell align="right">{file.bytes} bytes</TableCell>
							<TableCell align="right">{file.content_type}</TableCell>
							<TableCell align="right"><FileMenu file={file}/></TableCell>
						</TableRow>))
					}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
