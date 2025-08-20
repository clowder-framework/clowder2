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

// Define the file details
interface FileDetails {
	fileId: string;
	fileName: string;
}

// Define the RecursiveComponent component with props type
interface RecursiveComponentProps {
	item: FSItem;
	depth?: number;
	onSelectFile: (fileId: string, fileName: string) => void;
}

// Define a type for items in the directory structure
interface FSItem {
	datasetId: string;
	id?: string;
	label: string;
	children?: FSItem[] | undefined;
	type: string; // A FSItem can be a folder or a file,
	content_type?: string;
}

// Function to fetch children of a folder
async function fetchFolderFiles(
	datasetid: string,
	folderId: string | undefined
) {
	try {
		const response =
			await V2.DatasetsService.getDatasetFoldersAndFilesApiV2DatasetsDatasetIdFoldersAndFilesGet(
				datasetid,
				folderId,
				// TODO: Remove hardcoded values
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
	onSelectFile,
}) => {
	const [expanded, setExpanded] = useState(false);
	const [children, setChildren] = useState<FSItem[] | undefined>(item.children);
	const isFolderOrDataset = item.type === "folder" || item.type === "dataset";

	// Function to generate Icon based on item type
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

	// Function to handle selection of folder or file
	const onSelect = () => {
		if (isFolderOrDataset) {
			if (!expanded) {
				fetchFolderFiles(item.datasetId, item.id).then((data) => {
					setChildren(data);
				});
			}
			setExpanded(!expanded);
		} else {
			if (item.id !== undefined) {
				onSelectFile(item.id, item.label);
			}
		}
	};

	return (
		<List disablePadding>
			{/* Indentation of item proportional to depth */}
			<ListItem
				sx={{
					pl: depth * 2,
					borderBottom: "none",
					py: 0.5,
					"&:hover": {
						backgroundColor: "rgba(0, 0, 0, 0.1)", // or any other color
						cursor: "pointer",
					},
				}}
				onClick={onSelect}
			>
				<ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
					<IconButton
						size="small"
						sx={{ visibility: isFolderOrDataset ? "visible" : "hidden" }}
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
								onSelectFile={onSelectFile}
							/>
						))}
					</Box>
				)}
			</Collapse>
		</List>
	);
};

const FileSystemViewer: React.FC<{
	onSelectFile: (fileId: string, fileName: string) => void;
}> = ({ onSelectFile }) => {
	const dispatch = useDispatch();
	const datasets = useSelector((state: any) => state.dataset.datasets);
	const [FSItems, setFSItems] = useState<FSItem[]>([]);

	// API function call to get Datasets
	const listDatasets = (skip?: number, limit?: number, mine?: boolean) => {
		dispatch(fetchDatasets(skip, limit, mine));
	};

	// Fetch datasets on component mount
	useEffect(() => {
		// TODO: Remove hardcoded values for skip and limit
		listDatasets(0, 3000, true);
	}, []); //

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
					onSelectFile={onSelectFile}
				/>
			))}
		</Box>
	) : null;
};

const DatasetFileViewer: React.FC<{
	onSelectFile: (fileId: string, fileName: string) => void;
	datasetId: string;
}> = ({ onSelectFile, datasetId }) => {
	const [FSItems, setFSItems] = useState<FSItem[]>([]);

	// Only display contents of the passed dataset
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
					onSelectFile={onSelectFile}
				/>
			))}
		</Box>
	) : null;
};

const FileSelector: React.FC<{
	showOnlyDatasetFiles: boolean;
	datasetId: string | undefined;
	onChange: (fileId: string) => void;
}> = ({ showOnlyDatasetFiles, datasetId, onChange }) => {
	const [open, setOpen] = useState(false);
	const [selectedFile, setSelectedFile] = useState<FileDetails>({
		fileId: "",
		fileName: "",
	});

	const handleOpen = () => setOpen(true);
	const handleClose = () => setOpen(false);

	const handleFileSelect = (fileId: string, fileName: string) => {
		setSelectedFile({ fileId: fileId, fileName: fileName });
		onChange(fileId);
		handleClose();
	};

	return (
		<Box sx={{ display: "flex", alignItems: "center", gap: 2, p: 2 }}>
			{selectedFile.fileName && (
				<Typography variant="subtitle1" sx={{ ml: 2 }}>
					{selectedFile.fileName}
				</Typography>
			)}
			<Button
				variant="outlined"
				onClick={handleOpen}
				startIcon={<InsertDriveFileIcon />}
			>
				Choose File
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
							onSelectFile={handleFileSelect}
							datasetId={datasetId as string}
						/>
					) : (
						<FileSystemViewer onSelectFile={handleFileSelect} />
					)}
				</Box>
			</Modal>
		</Box>
	);
};

export default FileSelector;
