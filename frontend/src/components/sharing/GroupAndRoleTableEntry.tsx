import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Collapse from "@mui/material/Collapse";
import { GroupAndRole } from "../../openapi/v2";
import {
	Button,
	ButtonGroup,
	Dialog,
	DialogActions,
	DialogContent,
	DialogTitle,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
} from "@mui/material";
import { AuthWrapper } from "../auth/AuthWrapper";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import GroupIcon from "@mui/icons-material/Group";
import EditIcon from "@mui/icons-material/Edit";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteIcon from "@mui/icons-material/Delete";
import { RootState } from "../../types/data";
import { theme } from "../../theme";
import {
	fetchDatasetRoles,
	removeDatasetGroupRole,
	setDatasetGroupRole,
} from "../../actions/dataset";
import { Link as RouterLink, useParams } from "react-router-dom";
import { GroupAndRoleSubTable } from "./GroupAndRoleSubTable";

type GroupAndRoleTableEntryProps = {
	group_role: GroupAndRole;
};

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export function GroupAndRoleTableEntry(props: GroupAndRoleTableEntryProps) {
	const { group_role } = props;
	const { datasetId } = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole
	);

	const [expand, setExpand] = React.useState(false);

	const groupRoleAssigned = (
		dataset_id: string | undefined,
		group_id: string | undefined,
		role: string | undefined
	) => dispatch(setDatasetGroupRole(dataset_id, group_id, role));

	const removeGroupRole = async (
		dataset_id: string | undefined,
		group_id: string | undefined
	) => dispatch(removeDatasetGroupRole(dataset_id, group_id));

	const [selectedRole, setSelectedRole] = useState(group_role.role);
	const [editRoleOn, setEditRoleOn] = useState(false);
	const [deleteRoleConfirmation, setDeleteRoleConfirmation] = useState(false);

	const handleRoleSelection = (e) => {
		setSelectedRole(e.target.value);
	};

	// Resume to the current state in redux
	const handleRoleCancel = () => {
		setSelectedRole(selectedRole);
		setEditRoleOn(false);
	};

	const handleRoleSave = () => {
		groupRoleAssigned(datasetId, group_role.group.id, selectedRole);
		setEditRoleOn(false);
	};

	const getRoles = (datasetId: string | undefined) =>
		dispatch(fetchDatasetRoles(datasetId));

	const handleRoleDelete = async () => {
		await removeGroupRole(datasetId, group_role.group.id);
		setDeleteRoleConfirmation(false);
		getRoles(datasetId);
	};

	return (
		<React.Fragment>
			<Dialog
				open={deleteRoleConfirmation}
				onClose={() => setDeleteRoleConfirmation(false)}
			>
				<DialogTitle>Are you sure?</DialogTitle>
				<DialogContent>Do you really want to delete this role?</DialogContent>
				<DialogActions>
					<Button variant={"contained"} onClick={handleRoleDelete}>
						Delete
					</Button>
					<Button onClick={() => setDeleteRoleConfirmation(false)}>
						Close
					</Button>
				</DialogActions>
			</Dialog>
			<TableRow
				key={group_role.group.id}
				sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
			>
				<TableCell align="right">
					<IconButton
						type="button"
						sx={{ p: "6px" }}
						aria-label="edit"
						onClick={() => {
							setExpand(!expand);
						}}
					>
						{expand ? (
							<ExpandLessIcon sx={iconStyle} />
						) : (
							<ExpandMoreIcon sx={iconStyle} />
						)}
					</IconButton>
				</TableCell>
				<TableCell>
					<GroupIcon sx={iconStyle} />
					<Button component={RouterLink} to={`/groups/${group_role.group.id}`}>
						{group_role.group.name}
					</Button>
				</TableCell>
				<TableCell align="right">
					{group_role.group.users ? group_role.group.users.length : 0} members
				</TableCell>
				<TableCell align="right">
					{editRoleOn ? (
						<FormControl size="small">
							<InputLabel id="demo-simple-select-label">Role</InputLabel>
							<Select
								labelId="role"
								id="role"
								value={selectedRole}
								label="Role"
								onChange={handleRoleSelection}
							>
								<MenuItem value="owner">Owner</MenuItem>
								<MenuItem value="editor">Editor</MenuItem>
								<MenuItem value="uploader">Uploader</MenuItem>
								<MenuItem value="viewer">Viewer</MenuItem>
							</Select>
						</FormControl>
					) : (
						selectedRole
					)}
					{/*only owner or editor are allowed to modify roles of the member*/}
					<AuthWrapper
						currRole={datasetRole.role}
						allowedRoles={["owner", "editor"]}
					>
						{editRoleOn ? (
							<ButtonGroup variant="text">
								<IconButton
									type="button"
									sx={{ p: "10px" }}
									onClick={handleRoleSave}
								>
									<CheckIcon sx={iconStyle} />
								</IconButton>
								<IconButton
									type="button"
									sx={{ p: "10px" }}
									onClick={handleRoleCancel}
								>
									<CloseIcon sx={iconStyle} />
								</IconButton>
							</ButtonGroup>
						) : (
							<>
								<IconButton
									type="button"
									sx={{ p: "10px" }}
									aria-label="edit"
									onClick={() => {
										setEditRoleOn(true);
									}}
								>
									<EditIcon sx={iconStyle} />
								</IconButton>
							</>
						)}
					</AuthWrapper>
				</TableCell>
				<TableCell align="right">
					<AuthWrapper
						currRole={datasetRole.role}
						allowedRoles={["owner", "editor"]}
					>
						<IconButton
							type="button"
							sx={{ p: "10px" }}
							aria-label="edit"
							onClick={() => {
								setDeleteRoleConfirmation(true);
							}}
						>
							<DeleteIcon sx={iconStyle} />
						</IconButton>
					</AuthWrapper>
				</TableCell>
			</TableRow>
			<TableRow>
				<TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6}>
					<Collapse in={expand} timeout="auto" unmountOnExit>
						<GroupAndRoleSubTable group={group_role.group} />
					</Collapse>
				</TableCell>
			</TableRow>
		</React.Fragment>
	);
}
