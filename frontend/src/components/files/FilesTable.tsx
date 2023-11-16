import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { theme } from "../../theme";
import { parseDate } from "../../utils/common";
import { FilesTableFileEntry } from "./FilesTableFileEntry";
import FolderMenu from "./FolderMenu";

type FilesTableProps = {
	datasetId: string | undefined;
	folderId: string | null;
	publicView: boolean | false;
};

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export default function FilesTable(props: FilesTableProps) {
	const {publicView} = props;
	// mapStateToProps
	const filesInDataset = useSelector((state: RootState) => state.dataset.files);
	const publicFilesInDataset = useSelector((state: RootState) => state.publicDataset.public_files);
	const foldersInDataset = useSelector(
		(state: RootState) => state.folder.folders
	);
	// use history hook to redirect/navigate between routes
	const history = useNavigate();
	// get existing folder
	const parentFolderId = props.folderId;
	const selectFile = (selectedFileId: string | undefined) => {
		// Redirect to file route with file Id and dataset id and folderId
		history(
			`/files/${selectedFileId}?dataset=${props.datasetId}&folder=${parentFolderId}&verNum=${selectedFileId}`
		);
	};
	const selectFolder = (selectedFolderId: string | undefined) => {
		// Redirect to file route with file Id and dataset id
		history(`/datasets/${props.datasetId}?folder=${selectedFolderId}`);
	};

	return (
		<TableContainer component={Paper}>
			{publicView?
				(
					<Table sx={{ minWidth: 650 }} aria-label="simple table">
						<TableHead>
							<TableRow>
								<TableCell>Name</TableCell>
								<TableCell>Version</TableCell>
								<TableCell align="right">Created</TableCell>
								<TableCell align="right">Size</TableCell>
								<TableCell align="right">Type</TableCell>
								<TableCell align="right" />
							</TableRow>
						</TableHead>
						<TableBody>
							{foldersInDataset.map((folder) => (
								<TableRow
									key={folder.id}
									sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
								>
									<TableCell component="th" scope="row">
										<FolderIcon sx={iconStyle} />
										<Button onClick={() => selectFolder(folder.id)}>
											{folder.name}
										</Button>
									</TableCell>
									<TableCell align="right">&nbsp;</TableCell>
									<TableCell align="right">{parseDate(folder.created)}</TableCell>
									<TableCell align="right">&nbsp;</TableCell>
									<TableCell align="right">&nbsp;</TableCell>
									<TableCell align="right">
										<FolderMenu folder={folder} />
									</TableCell>
								</TableRow>
							))}
							{publicFilesInDataset.map((file) => (
								<FilesTableFileEntry
									iconStyle={iconStyle}
									selectFile={selectFile}
									file={file}
									key={file.id}
									parentFolderId={parentFolderId}
								/>
							))}
						</TableBody>
					</Table>
				) :
				<Table sx={{ minWidth: 650 }} aria-label="simple table">
					<TableHead>
						<TableRow>
							<TableCell>Name</TableCell>
							<TableCell>Version</TableCell>
							<TableCell align="right">Created</TableCell>
							<TableCell align="right">Size</TableCell>
							<TableCell align="right">Type</TableCell>
							<TableCell align="right" />
						</TableRow>
					</TableHead>
					<TableBody>
						{foldersInDataset.map((folder) => (
							<TableRow
								key={folder.id}
								sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									<FolderIcon sx={iconStyle} />
									<Button onClick={() => selectFolder(folder.id)}>
										{folder.name}
									</Button>
								</TableCell>
								<TableCell align="right">&nbsp;</TableCell>
								<TableCell align="right">{parseDate(folder.created)}</TableCell>
								<TableCell align="right">&nbsp;</TableCell>
								<TableCell align="right">&nbsp;</TableCell>
								<TableCell align="right">
									<FolderMenu folder={folder} />
								</TableCell>
							</TableRow>
						))}
						{filesInDataset.map((file) => (
							<FilesTableFileEntry
								iconStyle={iconStyle}
								selectFile={selectFile}
								file={file}
								key={file.id}
								parentFolderId={parentFolderId}
							/>
						))}
					</TableBody>
				</Table>
			}


		</TableContainer>
	);
}
