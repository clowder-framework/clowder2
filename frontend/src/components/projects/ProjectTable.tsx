import React, { useEffect, useState } from "react";
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
import { FilesTableFileEntry } from "../files/FilesTableFileEntry";
import { useDispatch } from "react-redux";
import FolderMenu from "./FolderMenu";
import { AuthWrapper } from "../auth/AuthWrapper";
import { FrozenWrapper } from "../auth/FrozenWrapper";
import { V2 } from "../../openapi";
import { DatsetTableEntry } from "../datasets/DatasetTableEntry";

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export default function ProjectTable(props) {
	const { project } = props;

	// useNavigate hook for navigation
	const navigate = useNavigate();
	const selectDataset = (selectedDatasetId) => {
		navigate(`/datasets/${selectedDatasetId}`);
	};
	const selectFile = (selectedFileId) => {
		navigate(`/files/${selectedFileId}`);
	};
	const selectFolder = (selectedFolderId) => {
		navigate(`/folders/${selectedFolderId}`);
	};

	const dispatch = useDispatch();

	const [datasets, setDatasets] = useState([]);
	const [folders, setFolders] = useState([]);
	const [files, setFiles] = useState([]);

	useEffect(() => {
		if (project) {
			if (project.dataset_ids) {
				listDatasets(project.dataset_ids);
			}
			if (project.file_ids) {
				listFiles(project.file_ids);
			}
		}
	}, [project]);

	const listDatasets = async (datasetIds) => {
		try {
			const fetchedDatasets = await Promise.all(
				datasetIds.map(async (id) => {
					return V2.DatasetsService.getDatasetApiV2DatasetsDatasetIdGet(id);
				})
			);
			setDatasets(fetchedDatasets);
		} catch (error) {
			console.error("Error fetching datasets:", error);
		}
	};

	const listFiles = async (fileIds) => {
		try {
			const fetchedFiles = await Promise.all(
				fileIds.map(async (id) => {
					return V2.FilesService.getFileSummaryApiV2FilesFileIdSummaryGet(id);
				})
			);
			setFiles(fetchedFiles);
		} catch (error) {
			console.error("Error fetching files:", error);
		}
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
					{datasets.map((item) => (
						<DatsetTableEntry
							iconStyle={iconStyle}
							selectDataset={selectDataset}
							dataset={item}
							key={item.id}
						/>
					))}
					{files.map((item) => (
						<FilesTableFileEntry
							iconStyle={iconStyle}
							selectFile={selectFile}
							file={item}
							key={item.id}
							parentFolderId={null}
							publicView={false}
						/>
					))}
				</TableBody>
			</Table>
		</TableContainer>
	);
}
