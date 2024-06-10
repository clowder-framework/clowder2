import React, { useState } from "react";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Gravatar from "react-gravatar";
import PersonIcon from "@mui/icons-material/Person";
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
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import { theme } from "../../theme";
import { UserAndRole } from "../../openapi/v2";
import {
	fetchDatasetRoles,
	removeDatasetUserRole,
	setDatasetUserRole,
} from "../../actions/dataset";
import { useParams } from "react-router-dom";

type UserAndRoleTableEntryProps = {
	user_role: UserAndRole;
};

const iconStyle = {
	verticalAlign: "middle",
	color: theme.palette.primary.main,
};

export function UserAndRoleTableEntry(props: UserAndRoleTableEntryProps) {
	const { user_role } = props;
	const { datasetId } = useParams<{ datasetId?: string }>();

	const dispatch = useDispatch();
	const datasetRole = useSelector(
		(state: RootState) => state.dataset.datasetRole,
	);

	const userRoleAssigned = (
		dataset_id: string | undefined,
		username: string | undefined,
		role: string | undefined,
	) => dispatch(setDatasetUserRole(dataset_id, username, role));

	const removeUserRole = async (
		dataset_id: string | undefined,
		username: string | undefined,
	) => dispatch(removeDatasetUserRole(dataset_id, username));

	const getRoles = (datasetId: string | undefined) =>
		dispatch(fetchDatasetRoles(datasetId));

	const [selectedRole, setSelectedRole] = useState(user_role.role);
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
		userRoleAssigned(datasetId, user_role.user.email, selectedRole);
		setEditRoleOn(false);
	};

	const handleRoleDelete = async () => {
		await removeUserRole(datasetId, user_role.user.email);
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
				key={user_role.user.id}
				sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
			>
				<TableCell align="right" />
				<TableCell component="th" scope="row" key={`${user_role.user.id}-icon`}>
					{user_role.user && user_role.user.email ? (
						<Gravatar
							email={user_role.user.email}
							rating="g"
							style={{
								width: "32px",
								height: "32px",
								borderRadius: "50%",
								verticalAlign: "middle",
							}}
						/>
					) : (
						<PersonIcon sx={iconStyle} />
					)}
					<Button>
						{user_role.user.first_name} {user_role.user.last_name}
					</Button>
				</TableCell>
				<TableCell align="right">{user_role.user.email}</TableCell>
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
		</React.Fragment>
	);
}
