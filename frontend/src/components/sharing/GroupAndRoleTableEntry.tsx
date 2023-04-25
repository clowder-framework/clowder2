import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import Collapse from "@mui/material/Collapse";
import { GroupAndRole } from "../../openapi/v2";
import {
	ButtonGroup,
	FormControl,
	IconButton,
	InputLabel,
	MenuItem,
	Select,
} from "@mui/material";
import { AuthWrapper } from "../auth/AuthWrapper";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import ListIcon from "@mui/icons-material/List";
import EditIcon from "@mui/icons-material/Edit";
import { RootState } from "../../types/data";
import { theme } from "../../theme";
import { setDatasetGroupRole } from "../../actions/dataset";
import { useParams } from "react-router-dom";
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

	const [selectedRole, setSelectedRole] = useState(group_role.role);
	const [editRoleOn, setEditRoleOn] = useState(false);

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

	return (
		<React.Fragment>
			<TableRow
				key={group_role.group.id}
				sx={{ "&:last-child td, &:last-child th": { border: 0 } }}
			>
				<TableCell>{group_role.group.name}</TableCell>
				<TableCell align="right">
					{group_role.group.users ? group_role.group.users.length : 0}
					<IconButton
						type="button"
						sx={{ p: "10px" }}
						aria-label="edit"
						onClick={() => {
							setExpand(!expand);
						}}
					>
						<ListIcon sx={iconStyle} />
					</IconButton>
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
						)}
					</AuthWrapper>
				</TableCell>
				<TableCell align="right" />
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
