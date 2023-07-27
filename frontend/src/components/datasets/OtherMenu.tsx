import {Box, Button, ListItemIcon, ListItemText, Menu, MenuItem} from "@mui/material";
import ArrowDropDownIcon from "@mui/icons-material/ArrowDropDown";
import React, {useEffect, useState} from "react";
import {ActionModal} from "../dialog/ActionModal";
import {datasetDeleted, fetchFilesInDataset} from "../../actions/dataset";
import {fetchGroups} from "../../actions/group";
import {useNavigate} from "react-router-dom";
import {useDispatch} from "react-redux";
import {MoreHoriz} from "@material-ui/icons";
import DeleteIcon from "@mui/icons-material/Delete";
import ShareIcon from '@mui/icons-material/Share';
import ShareDatasetModal from "./ShareDatasetModal"
import ShareGroupDatasetModal from "./ShareGroupDatasetModal";

type ActionsMenuProps = {
	datasetId: string,
	datasetName: string
}

export const OtherMenu = (props: ActionsMenuProps): JSX.Element => {
	const {datasetId, datasetName} = props;

	// use history hook to redirect/navigate between routes
	const history = useNavigate();

	// redux
	const dispatch = useDispatch();
	const deleteDataset = (datasetId: string | undefined) => dispatch(datasetDeleted(datasetId));
	const listGroups = () => dispatch(fetchGroups(0, 21));

	// component did mount
	useEffect(() => {
		listGroups();
	}, []);

	// state
	const [deleteDatasetConfirmOpen, setDeleteDatasetConfirmOpen] = useState(false);



	// delete dataset
	const deleteSelectedDataset = () => {
		if (datasetId) {
			deleteDataset(datasetId);
		}
		setDeleteDatasetConfirmOpen(false);
		// Go to Explore page
		history("/");
	}

	const [anchorEl, setAnchorEl] = React.useState<Element | null>(null);

	const handleOptionClick = (event: React.MouseEvent<any>) => {
		setAnchorEl(event.currentTarget);
	};

	const handleOptionClose = () => {
		setAnchorEl(null);
	};

	return (
		<Box>
			<ActionModal actionOpen={deleteDatasetConfirmOpen} actionTitle="Are you sure?"
						 actionText="Do you really want to delete this dataset? This process cannot be undone."
						 actionBtnName="Delete" handleActionBtnClick={deleteSelectedDataset}
						 handleActionCancel={() => {
							 setDeleteDatasetConfirmOpen(false);
						 }}/>
			<Button variant="outlined" onClick={handleOptionClick}
					endIcon={<ArrowDropDownIcon/>}>
				<MoreHoriz/>
			</Button>
			<Menu
				id="simple-menu"
				anchorEl={anchorEl}
				keepMounted
				open={Boolean(anchorEl)}
				onClose={handleOptionClose}
			>
				<MenuItem
					onClick={() => {
						handleOptionClose();
						setDeleteDatasetConfirmOpen(true);
					}
					}>
					<ListItemIcon>
						<DeleteIcon fontSize="small"/>
					</ListItemIcon>
					<ListItemText>Delete Dataset</ListItemText></MenuItem>
			</Menu>
		</Box>)
}
