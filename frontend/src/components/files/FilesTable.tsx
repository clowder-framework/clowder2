import * as React from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useNavigate } from "react-router-dom";
import { Button } from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import { theme } from "../../theme";
import { parseDate } from "../../utils/common";
import { FilesTableFileEntry } from "./FilesTableFileEntry";
import FolderMenu from "./FolderMenu";
import { FileOut, FolderOut } from "../../openapi/v2";

type FilesTableProps = {
	datasetId: string | undefined;
	folderId: string | null;
	filesInDataset: FileOut[];
	foldersInDataset: FolderOut[];
};

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export default function FilesTable(props: FilesTableProps) {
	const { folderId, datasetId, filesInDataset, foldersInDataset } = props;

	// use history hook to redirect/navigate between routes
	const history = useNavigate();
	// get existing folder
	const selectFile = (selectedFileId: string | undefined) => {
		// Redirect to file route with file Id and dataset id and folderId
		history(
			`/files/${selectedFileId}?dataset=${datasetId}&folder=${folderId}&verNum=${selectedFileId}`
		);
	};
	const selectFolder = (selectedFolderId: string | undefined) => {
		// Redirect to file route with file Id and dataset id
		history(`/datasets/${datasetId}?folder=${selectedFolderId}`);
	};

	return (
		<TableContainer component={Paper}>
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
					{foldersInDataset.map((folder: FolderOut) => (
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
					{filesInDataset.map((file: FileOut) => (
						<FilesTableFileEntry
							iconStyle={iconStyle}
							selectFile={selectFile}
							file={file}
							key={file.id}
							parentFolderId={folderId}
						/>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
