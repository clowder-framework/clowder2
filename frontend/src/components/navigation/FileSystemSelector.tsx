import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	Button,
	Box,
	Modal,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Typography,
	IconButton,
	Collapse,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import DatasetIcon from "@mui/icons-material/Dataset";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ImageIcon from "@mui/icons-material/Image";
import AudioIcon from "@mui/icons-material/Audiotrack";
import VideoIcon from "@mui/icons-material/VideoFile";
import TextIcon from "@mui/icons-material/Description";

import { fetchDatasets } from "../../actions/dataset";
import { V2 } from "../../openapi";

interface SelectionDetails {
	selectionID: string;
	selectionName: string;
	selectionType: string;
	datasetId?: string;
}

interface RecursiveComponentProps {
	item: FSItem;
	depth?: number;
	onHighlightSelection: (
		selectionID: string,
		selectionName: string,
		datasetId: string,
		selectionType: string
	) => void;
	highlightedSelectionId: string;
	selectFolder: boolean;
}

interface FSItem {
	datasetId: string;
	id?: string;
	label: string;
	children?: FSItem[] | undefined;
	type: string;
	content_type?: string;
}

async function fetchFolderFiles(
	datasetid: string,
	folderId: string | undefined
) {
	try {
		const response =
			await V2.DatasetsService.getDatasetFoldersAndFilesApiV2DatasetsDatasetIdFoldersAndFilesGet(
				datasetid,
				folderId,
				0,
				3000
			);
		const data = response.data;
		const FSItems: FSItem[] =
			data !== undefined
				? data.map((FSItem: any) => ({
						datasetId: datasetid,
						id: FSItem.id,
						label: FSItem.name,
						children: FSItem.object_type === "folder" ? [] : undefined,
						type: FSItem.object_type,
						content_type:
							FSItem.object_type !== "folder"
								? FSItem.content_type.main_type
								: undefined,
				  }))
				: [];
		return FSItems;
	} catch (error) {
		console.error("Error fetching folders and files", error);
	}
}

const RecursiveComponent: React.FC<RecursiveComponentProps> = ({
	item,
	depth = 0,
	onHighlightSelection,
	highlightedSelectionId,
	selectFolder,
}) => {
	const [expanded, setExpanded] = useState(false);
	const [children, setChildren] = useState<FSItem[] | undefined>(item.children);
	const isFolderOrDataset = item.type === "folder" || item.type === "dataset";
	const isHighlighted = item.id === highlightedSelectionId;

	const getIcon = () => {
		if (item.type === "folder") {
			return <FolderIcon />;
		} else if (item.type === "dataset") {
			return <DatasetIcon />;
		}
		switch (item.content_type) {
			case "image":
				return <ImageIcon />;
			case "audio":
				return <AudioIcon />;
			case "video":
				return <VideoIcon />;
			case "text":
				return <TextIcon />;
			default:
				return <InsertDriveFileIcon />;
		}
	};

	const expandFolder = () => {
		if (isFolderOrDataset) {
			fetchFolderFiles(item.datasetId, item.id).then((data) => {
				setChildren(data);
			});
			setExpanded(!expanded);
		}
	};

	const onSelect = () => {
		if (item.id !== undefined) {
			onHighlightSelection(item.id, item.label, item.datasetId, item.type);
		}
	};

	return (
		<List disablePadding>
			<ListItem
				sx={{
					pl: depth * 2,
					borderBottom: "none",
					py: 0.5,
					backgroundColor: isHighlighted
						? "rgba(25, 118, 210, 0.12)"
						: "transparent",
					"&:hover": {
						backgroundColor: isHighlighted
							? "rgba(25, 118, 210, 0.2)"
							: "rgba(0, 0, 0, 0.1)",
						cursor: "pointer",
					},
				}}
				onClick={onSelect}
			>
				<ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
					<IconButton
						size="small"
						sx={{ visibility: isFolderOrDataset ? "visible" : "hidden" }}
						onClick={expandFolder}
					>
						<ExpandMoreIcon
							style={{
								transform: expanded ? "rotate(0deg)" : "rotate(-90deg)",
							}}
						/>
					</IconButton>
				</ListItemIcon>
				<ListItemIcon sx={{ minWidth: "auto" }}>{getIcon()}</ListItemIcon>
				<ListItemText primary={item.label} />
			</ListItem>
			<Collapse in={expanded} timeout="auto" unmountOnExit>
				{isFolderOrDataset && (
					<Box sx={{ ml: 2 }}>
						{children?.map((child) => (
							<RecursiveComponent
								key={child.id}
								item={child}
								depth={depth + 1}
								onHighlightSelection={onHighlightSelection}
								highlightedSelectionId={highlightedSelectionId}
								selectFolder={selectFolder}
							/>
						))}
					</Box>
				)}
			</Collapse>
		</List>
	);
};

const FileSystemViewer: React.FC<{
	onHighlightSelection: (
		selectionID: string,
		selectionName: string,
		datasetId: string,
		selectionType: string
	) => void;
	highlightedSelectionId: string;
	selectFolder: boolean;
}> = ({ onHighlightSelection, highlightedSelectionId, selectFolder }) => {
	const dispatch = useDispatch();
	const datasets = useSelector((state: any) => state.dataset.datasets);
	const [FSItems, setFSItems] = useState<FSItem[]>([]);

	const listDatasets = (skip?: number, limit?: number, mine?: boolean) => {
		dispatch(fetchDatasets(skip, limit, mine));
	};

	useEffect(() => {
		listDatasets(0, 3000, true);
	}, []);

	useEffect(() => {
		if (datasets.data) {
			setFSItems(
				datasets.data.map((dataset: any) => ({
					datasetId: dataset.id,
					label: dataset.name,
					children: [],
					type: "dataset",
				}))
			);
		}
	}, [datasets]);

	return FSItems.length > 0 ? (
		<Box
			sx={{
				width: "100%",
				height: 360,
				maxWidth: 360,
				overflowY: "auto",
				overflowX: "auto",
				bgcolor: "background.paper",
			}}
		>
			<Typography variant="h6" sx={{ ml: 2, my: 2 }}>
				File Selector
			</Typography>
			{FSItems.map((FSItem) => (
				<RecursiveComponent
					key={FSItem.id}
					item={FSItem}
					onHighlightSelection={onHighlightSelection}
					highlightedSelectionId={highlightedSelectionId}
					selectFolder={selectFolder}
				/>
			))}
		</Box>
	) : null;
};

const DatasetFileViewer: React.FC<{
	onHighlightSelection: (
		selectionID: string,
		selectionName: string,
		datasetId: string,
		selectionType: string
	) => void;
	highlightedSelectionId: string;
	datasetId: string;
	selectFolder: boolean;
}> = ({
	onHighlightSelection,
	highlightedSelectionId,
	datasetId,
	selectFolder,
}) => {
	const [FSItems, setFSItems] = useState<FSItem[]>([]);

	useEffect(() => {
		fetchFolderFiles(datasetId, undefined).then((data) => {
			setFSItems(data);
		});
	}, [datasetId]);

	return FSItems.length > 0 ? (
		<Box
			sx={{
				width: "100%",
				height: 360,
				maxWidth: 360,
				overflowY: "auto",
				overflowX: "auto",
				bgcolor: "background.paper",
			}}
		>
			<Typography variant="h6" sx={{ ml: 2, my: 2 }}>
				File Selector
			</Typography>
			{FSItems.map((FSItem) => (
				<RecursiveComponent
					key={FSItem.id}
					item={FSItem}
					onHighlightSelection={onHighlightSelection}
					highlightedSelectionId={highlightedSelectionId}
					selectFolder={selectFolder}
				/>
			))}
		</Box>
	) : null;
};

const FileSystemSelector: React.FC<{
	showOnlyDatasetFiles: boolean;
	selectFolder: boolean;
	datasetId: string | undefined;
	onChange: (SelectionDetails: string) => void;
}> = ({ showOnlyDatasetFiles, selectFolder, datasetId, onChange }) => {
	const [open, setOpen] = useState(false);
	const [selection, setSelection] = useState<SelectionDetails>({
		selectionID: "",
		selectionName: "",
		datasetId: "",
		selectionType: "",
	});
	const [highlightedSelection, setHighlightedFile] = useState<SelectionDetails>(
		{
			selectionID: "",
			selectionName: "",
			datasetId: "",
			selectionType: "",
		}
	);

	const handleOpen = () => setOpen(true);
	const handleClose = () => {
		setHighlightedFile({
			selectionID: "",
			selectionName: "",
			selectionType: "",
		});
		setOpen(false);
	};

	const handleHighlight = (
		selectionID: string,
		selectionName: string,
		datasetId: string,
		selectionType: string
	) => {
		setHighlightedFile({
			selectionID,
			selectionName,
			datasetId,
			selectionType,
		});
	};

	const handleConfirmSelection = () => {
		if (highlightedSelection.selectionID) {
			setSelection(highlightedSelection);
			const selection = {
				selectionID: highlightedSelection.selectionID,
				selectionName: highlightedSelection.selectionName,
				datasetId: highlightedSelection.datasetId,
				selectionType: highlightedSelection.selectionType,
			}
			// Convert to string
			const selectionString = JSON.stringify(selection);
			onChange(selectionString);
			handleClose();
		}
	};

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
			{selection.selectionName && (
				<Typography variant="subtitle1" sx={{ ml: 2 }}>
					{selection.selectionName}
				</Typography>
			)}
			<Button
				variant="outlined"
				onClick={handleOpen}
				startIcon={<InsertDriveFileIcon />}
			>
				{selectFolder ? "Select Folder" : "Select File"}
			</Button>
			<Modal
				open={open}
				onClose={handleClose}
				aria-labelledby="file-selection-modal"
				aria-describedby="modal-modal-description"
			>
				<Box
					sx={{
						position: "absolute",
						top: "50%",
						left: "50%",
						transform: "translate(-50%, -50%)",
						width: 400,
						bgcolor: "background.paper",
						boxShadow: 24,
						p: 4,
					}}
				>
					{showOnlyDatasetFiles ? (
						<DatasetFileViewer
							onHighlightSelection={handleHighlight}
							highlightedSelectionId={highlightedSelection.selectionID}
							datasetId={datasetId as string}
							selectFolder={selectFolder}
						/>
					) : (
						<FileSystemViewer
							onHighlightSelection={handleHighlight}
							highlightedSelectionId={highlightedSelection.selectionID}
							selectFolder={selectFolder}
						/>
					)}
					<Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
						<Button
							variant="contained"
							onClick={handleConfirmSelection}
							disabled={
								selectFolder
									? highlightedSelection.selectionType !== "folder"
									: highlightedSelection.selectionType !== "file"
							}
						>
							Select
						</Button>
					</Box>
				</Box>
			</Modal>
		</Box>
	);
};

export default FileSystemSelector;
