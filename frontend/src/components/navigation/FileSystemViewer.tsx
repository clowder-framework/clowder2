import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
	Box,
	List,
	ListItem,
	ListItemIcon,
	ListItemText,
	Typography,
	IconButton,
	Collapse,
} from "@mui/material";
import FolderIcon from "@mui/icons-material/Folder";
import InsertDriveFileIcon from "@mui/icons-material/InsertDriveFile";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { fetchDatasets } from "../../actions/dataset";
import { V2 } from "../../openapi";

// Define the RecursiveComponent component with props type
interface RecursiveComponentProps {
	item: FSItem;
	depth?: number;
}

// Define a type for items in the directory structure
interface FSItem {
	datasetId: string;
	id?: string;
	label: string;
	children?: FSItem[] | null;
	type: string; // A FSItem can be a folder or a file
}

const RecursiveComponent: React.FC<RecursiveComponentProps> = ({
	item,
	depth = 0,
}) => {
	const [expanded, setExpanded] = useState(false);
	const [children, setChildren] = useState<FSItem[] | undefined>(item.children);
	const isFolder = item.type === "folder";

	// Function to generate Icon based on item type
	const getIcon = () => {
		if (isFolder) {
			return <FolderIcon />;
		}
		// TODO: Switch case to generate file icon based on file type
		return <InsertDriveFileIcon />;
	};

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
					30
				);
			const data = response.data;
			const FSItems = data.map((FSItem: any) => ({
				datasetId: datasetid,
				id: FSItem.id,
				label: FSItem.name,
				children: FSItem.object_type === "folder" ? [] : null,
				type: FSItem.object_type,
			}));
			return FSItems;
		} catch (error) {
			console.error("Error fetching folders and files", error);
		}
	}

	// Function to toggle expand/collapse of folder
	const toggleExpand = () => {
		if (!expanded && isFolder) {
			// Simulate an API call to fetch children
			fetchFolderFiles(item.datasetId, item.id).then((data) => {
				setChildren(data);
			});
		}
		setExpanded(!expanded);
	};

	return (
		<List disablePadding>
			{/*Indentation of item proportional to depth*/}
			<ListItem sx={{ pl: depth * 2, borderBottom: "none", py: 0.5 }}>
				<ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
					<IconButton
						size="small"
						onClick={toggleExpand}
						sx={{ visibility: isFolder ? "visible" : "hidden" }}
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
				{isFolder && (
					<Box sx={{ ml: 2 }}>
						{children?.map((child) => (
							<RecursiveComponent
								key={child.id}
								item={child}
								depth={depth + 1}
							/>
						))}
					</Box>
				)}
			</Collapse>
		</List>
	);
};

const FileSystemViewer: React.FC = () => {
	const dispatch = useDispatch();
	const datasets = useSelector((state: any) => state.dataset.datasets);
	const [FSItems, setFSItems] = useState<FSItem[]>([]);

	// API function call to get Datasets
	const listDatasets = (skip?: number, limit?: number, mine?: boolean) => {
		dispatch(fetchDatasets(skip, limit, mine));
	};

	// Fetch datasets on component mount
	useEffect(() => {
		listDatasets(0, 10, true);
	}, []); //

	useEffect(() => {
		if (datasets.data) {
			setFSItems(
				datasets.data.map((dataset: any) => ({
					datasetId: dataset.id,
					label: dataset.name,
					children: [],
					type: "folder",
				}))
			);
		}
	}, [datasets]);

	return FSItems.length > 0 ? (
		<Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
			<Typography variant="h6" sx={{ ml: 2, my: 2 }}>
				File Selector
			</Typography>
			{FSItems.map((FSItem) => (
				<RecursiveComponent key={FSItem.id} item={FSItem} />
			))}
		</Box>
	) : null;
};

export default FileSystemViewer;
