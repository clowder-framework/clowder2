import React, {useEffect, useState} from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import {useNavigate} from "react-router-dom";
import {theme} from "../../theme";
import {useDispatch} from "react-redux";
import {V2} from "../../openapi";
import {DatsetTableEntry} from "../datasets/DatasetTableEntry";

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export default function ProjectTable(props) {
	const {project} = props;

	// useNavigate hook for navigation
	const navigate = useNavigate();
	const selectDataset = (selectedDatasetId) => {
		navigate(`/datasets/${selectedDatasetId}`);
	};
	const selectFile = (selectedFileId) => {
		navigate(`/files/${selectedFileId}`);
	};
	const selectFolder = (selectedFolder) => {
		if (selectedFolder)
			navigate(
				`/datasets/${selectedFolder.dataset_id}?folder=${selectedFolder.id}`
			);
	};

	const dispatch = useDispatch();

	const [datasets, setDatasets] = useState([]);
	const [folders, setFolders] = useState([]);
	const [files, setFiles] = useState([]);

	useEffect(() => {
		// hack the folders for now
		setFolders([
			{
				id: "66a085640c20e43f5c50b059",
				name: "20240723233900",
				dataset_id: "669fcf3978f3222201e18a0d",
				parent_folder: null,
				creator: {
					email: "cwang138@illinois.edu",
					first_name: "Chen",
					last_name: "Wang",
					id: "669ea726d559628438e57841",
					admin: true,
					admin_mode: true,
					read_only_user: false,
				},
				created: "2024-07-24T04:39:00.710+0000",
				modified: "2024-07-24T04:39:00.710+0000",
				object_type: "folder",
			},
		]);
	}, []);

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
			<Table sx={{minWidth: 650}} aria-label="simple table">
				<TableHead>
					<TableRow>
						<TableCell>Name</TableCell>
						<TableCell align="right">Created</TableCell>
						<TableCell align="right">Size</TableCell>
						<TableCell align="right">Type</TableCell>
						<TableCell align="right"/>
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
				</TableBody>
			</Table>
		</TableContainer>
	);
}
