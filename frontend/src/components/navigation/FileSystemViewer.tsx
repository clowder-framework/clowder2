import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RichTreeView } from "@mui/x-tree-view/RichTreeView";
import { TreeViewBaseItem } from "@mui/x-tree-view/models";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import {
	fetchDatasets,
	fetchFoldersFilesInDataset,
} from "../../actions/dataset";
import { RootState } from "../../types/data";

const MUI_X_PRODUCTS: TreeViewBaseItem[] = [
	{
		id: "grid",
		label: "Data Grid",
		children: [
			{ id: "grid-community", label: "@mui/x-data-grid" },
			{ id: "grid-pro", label: "@mui/x-data-grid-pro" },
			{ id: "grid-premium", label: "@mui/x-data-grid-premium" },
		],
	},
	{
		id: "pickers",
		label: "Date and Time Pickers",
		children: [
			{ id: "pickers-community", label: "@mui/x-date-pickers" },
			{ id: "pickers-pro", label: "@mui/x-date-pickers-pro" },
		],
	},
	{
		id: "charts",
		label: "Charts",
		children: [{ id: "charts-community", label: "@mui/x-charts" }],
	},
	{
		id: "tree-view",
		label: "Tree View",
		children: [{ id: "tree-view-community", label: "@mui/x-tree-view" }],
	},
];

export const FileSystemViewer: React.FC = () => {
	const dispatch = useDispatch();
	const [lastSelectedItem, setLastSelectedItem] = React.useState<string | null>(
		null
	);
	// File System JSON to be used for rendering the TreeView
	const [fsJson, setFsJson] = useState({
		datasets: [],
		files: {},
		folders: {},
	});

	// API function call to get Datasets
	const listDatasets = (
		skip: number | undefined,
		limit: number | undefined,
		mine: boolean | undefined
	) => dispatch(fetchDatasets(skip, limit, mine));

	const listFilesFolders = (
		datasetId: string,
		folderId: string | undefined,
		skip: number | undefined,
		limit: number | undefined,
		recursive: boolean | undefined
	) =>
		dispatch(
			fetchFoldersFilesInDataset(datasetId, folderId, skip, limit, recursive)
		);

	const datasets = useSelector(
		(state: RootState) => state.dataset.datasets.data
	);

	const filesFolders = useSelector(
		(state: RootState) => state.dataset.foldersAndFiles.data
	);

	// Mounting datasets
	useEffect(() => {
		listDatasets(0, 30, false);
	}, []);

	useEffect(() => {
		if (datasets !== undefined && datasets.length > 0) {
			const updatedFsJson = { ...fsJson };
			datasets.forEach((dataset) => {
				const datasetEntry = {
					id: dataset.id,
					label: dataset.name,
					children: [],
				};
				updatedFsJson.datasets.push(datasetEntry);
				listFilesFolders(dataset.id, undefined, 0, 30, true);
			});
			setFsJson(updatedFsJson);
		}
	}, [datasets]);

	useEffect(() => {
		if (filesFolders !== undefined && filesFolders.length > 0) {
			const updatedFsJson = { ...fsJson };
			filesFolders.forEach((fileFolder) => {
				if (fileFolder.object_type === "folder") {
					if (!updatedFsJson.folders[fileFolder.folderId]) {
						updatedFsJson.folders[fileFolder.folderId] = [];
					}
					const folderEntry = {
						id: fileFolder.id,
						label: fileFolder.name,
						children: [],
					};
					updatedFsJson.folders[fileFolder.folderId].push(folderEntry);
				}
			});
			setFsJson(updatedFsJson);
		}
	}, [filesFolders]);

	useEffect(() => {
		console.log("fsJson:", fsJson);
	}, [fsJson]);

	// React.useEffect(() => {
	// 	console.log("lastSelectedItem:", lastSelectedItem);
	// }, [lastSelectedItem]);

	const handleItemSelectionToggle = (
		event: React.SyntheticEvent,
		itemId: string,
		isSelected: boolean
	) => {
		if (isSelected) {
			setLastSelectedItem(itemId);
		}
	};
	return (
		<Stack spacing={2}>
			<Typography variant="h6">Select File</Typography>
			<Box sx={{ minHeight: 200, minWidth: 300, flexGrow: 1 }}>
				<RichTreeView
					items={MUI_X_PRODUCTS}
					onItemSelectionToggle={handleItemSelectionToggle}
				/>
			</Box>
		</Stack>
	);
};

export default FileSystemViewer;
