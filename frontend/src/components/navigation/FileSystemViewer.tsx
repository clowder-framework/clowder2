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
import {
	fetchDatasets,
	fetchFoldersFilesInDataset,
} from "../../actions/dataset";

// Define a type for items in the directory structure
interface DirectoryItem {
	id: string;
	label: string;
	children?: DirectoryItem[];
}

// Define the RecursiveComponent component with props type
interface RecursiveComponentProps {
	item: DirectoryItem;
	depth?: number;
}

interface FSDataset {
	id: string;
	label: string;
	children?: DirectoryItem[];
}

const RecursiveComponent: React.FC<RecursiveComponentProps> = ({
	item,
	depth = 0,
}) => {
	const [expanded, setExpanded] = useState(false);
	const [children, setChildren] = useState<DirectoryItem[] | undefined>(
		item.children
	);
	const hasChildren = children && children.length > 0;

	// Function to generate Icon based on item type
	const getIcon = () => {
		if (hasChildren || !children) {
			return <FolderIcon />;
		}
		// TODO: Switch case to generate file icon based on file type
		return <InsertDriveFileIcon />;
	};

	const toggleExpand = () => {
		if (!expanded && !children) {
			// Simulate an API call to fetch children
			fetchChildren(item.id).then((data) => {
				setChildren(data);
			});
		}
		setExpanded(!expanded);
	};

	return (
		<List disablePadding>
			<ListItem sx={{ pl: depth * 2, borderBottom: "none", py: 0.5 }}>
				<ListItemIcon sx={{ minWidth: "auto", mr: 1 }}>
					<IconButton
						size="small"
						onClick={toggleExpand}
						sx={{ visibility: hasChildren || !children ? "visible" : "hidden" }}
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
				{hasChildren && (
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

// Simulated API call to fetch children based on parent ID
async function fetchChildren(parentId: string): Promise<DirectoryItem[]> {
	// Simulate delayed API response
	return new Promise((resolve) => {
		setTimeout(() => {
			resolve([
				{ id: `${parentId}-child-1`, label: "Child 1" },
				{ id: `${parentId}-child-2`, label: "Child 2" },
			]);
		}, 300);
	});
}

const FileSystemViewer: React.FC = () => {
	const dispatch = useDispatch();
	const datasets = useSelector((state: any) => state.dataset.datasets);
	const [FSDatasets, setFSDatasets] = useState<FSDataset[]>([]);

	// API function call to get Datasets
	const listDatasets = (skip?: number, limit?: number, mine?: boolean) => {
		dispatch(fetchDatasets(skip, limit, mine));
	};

	// Fetch root directories and datasets on component mount
	useEffect(() => {
		listDatasets(0, 10, true);
	}, []); // Include dispatch to satisfy exhaustive-deps rule

	useEffect(() => {
		if (datasets.data) {
			setFSDatasets(
				datasets.data.map((dataset: any) => ({
					id: dataset.id,
					label: dataset.name,
				}))
			);
		}
	}, [datasets]); // Depend on datasets to update FSDatasets

	return FSDatasets.length > 0 ? (
		<Box sx={{ width: "100%", maxWidth: 360, bgcolor: "background.paper" }}>
			<Typography variant="h6" sx={{ ml: 2, my: 2 }}>
				File System Viewer
			</Typography>
			{FSDatasets.map((FSDataset) => (
				<RecursiveComponent key={FSDataset.id} item={FSDataset} />
			))}
		</Box>
	) : null; // Optionally handle the case where roots are empty
};

export default FileSystemViewer;
