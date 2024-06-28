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
import { FileOut, FolderOut } from "../../openapi/v2";
import { useSelector } from "react-redux";
import { RootState } from "../../types/data";
import FolderMenu from "./FolderMenu";
import { AuthWrapper } from "../auth/AuthWrapper";
import { FrozenWrapper } from "../auth/FrozenWrapper";

type FilesTableProps = {
	folderId: string | null;
	foldersFilesInDataset: FileOut[] | FolderOut[];
	publicView: boolean | false;
	setCurrPageNum: any;
};

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export default function FilesTable(props: FilesTableProps) {
	const { folderId, foldersFilesInDataset, publicView, setCurrPageNum } = props;
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);
	const dataset = useSelector((state: RootState) => state.dataset.about);
	const publicDataset = useSelector(
		(state: RootState) => state.publicDataset.publicAbout
	);

	// use history hook to redirect/navigate between routes
	const history = useNavigate();
	// get existing folder
	const selectFile = (selectedFileId: string | undefined) => {
		// reset page number to 1
		setCurrPageNum(1);
		// Redirect to file route with file Id and dataset id and folderId
		history(
			`/files/${selectedFileId}?dataset=${dataset.id}&folder=${
				folderId ?? ""
			}&verNum=${selectedFileId}`
		);
	};
	const selectPublicFile = (selectedFileId: string | undefined) => {
		// reset page number to 1
		setCurrPageNum(1);
		// Redirect to file route with file Id and dataset id and folderId
		history(
			`/public_files/${selectedFileId}?dataset=${publicDataset.id}&folder=${
				folderId ?? ""
			}&verNum=${selectedFileId}`
		);
	};
	const selectFolder = (selectedFolderId: string | undefined) => {
		// reset page number to 1
		setCurrPageNum(1);
		// Redirect to file route with file Id and dataset id
		history(`/datasets/${dataset.id}?folder=${selectedFolderId}`);
	};

	const selectPublicFolder = (selectedFolderId: string | undefined) => {
		// reset page number to 1
		setCurrPageNum(1);
		// Redirect to file route with file Id and dataset id
		history(`/public_datasets/${publicDataset.id}?folder=${selectedFolderId}`);
	};

	return (
		<TableContainer component={Paper}>
			<Table sx={{ minWidth: 650 }} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell align="right">Created</TableCell>
						<TableCell align="right">Size</TableCell>
						<TableCell align="right">Type</TableCell>
						<TableCell align="right" />
					</TableRow>
				</TableHead>
				<TableBody>
					{foldersFilesInDataset.map((item) =>
						item.object_type === "folder" ? (
							<TableRow
								key={item.id}
								sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
							>
								<TableCell component="th" scope="row">
									<FolderIcon sx={iconStyle} />
									<Button
										onClick={() =>
											publicView
												? selectPublicFolder(item.id)
												: selectFolder(item.id)
										}
									>
										{item.name}
									</Button>
								</TableCell>
								<TableCell align="right">{parseDate(item.created)}</TableCell>
								<TableCell align="right">&nbsp;</TableCell>
								<TableCell align="right">&nbsp;</TableCell>
								<TableCell align="right">
									<FrozenWrapper
										frozen={dataset.frozen}
										frozenVersionNum={dataset.frozen_version_num}
									>
										{/*owner, editor can delete and edit folder*/}
										<AuthWrapper
											currRole={datasetRole.role}
											allowedRoles={["owner", "editor"]}
										>
											<FolderMenu folder={item} />
										</AuthWrapper>
									</FrozenWrapper>
								</TableCell>
							</TableRow>
						) : (
							<FilesTableFileEntry
								iconStyle={iconStyle}
								selectFile={publicView ? selectPublicFile : selectFile}
								file={item}
								key={item.id}
								parentFolderId={folderId}
								publicView={publicView}
							/>
						)
					)}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
