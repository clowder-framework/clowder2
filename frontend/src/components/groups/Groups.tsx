import React, { ChangeEvent, useEffect, useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Link as MuiLink,
	Pagination,
} from "@mui/material";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchGroups,
	searchGroups as searchGroupsAction,
} from "../../actions/group";
import { Link } from "react-router-dom";
import Paper from "@mui/material/Paper";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import TableContainer from "@mui/material/TableContainer";
import GroupsIcon from "@mui/icons-material/Groups";
import Layout from "../Layout";
import GroupAddIcon from "@mui/icons-material/GroupAdd";
import { CreateGroup } from "./CreateGroup";
import { ErrorModal } from "../errors/ErrorModal";
import { GenericSearchBox } from "../search/GenericSearchBox";
import config from "../../app.config";
import DeleteIcon from "@mui/icons-material/Delete";
import DeleteGroupModal from "./DeleteGroupModal";

export function Groups() {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listGroups = (skip: number | undefined, limit: number | undefined) =>
		dispatch(fetchGroups(skip, limit));
	const searchGroups = (
		searchTerm: string,
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(searchGroupsAction(searchTerm, skip, limit));

	const groups = useSelector((state: RootState) => state.group.groups.data);
	const pageMetadata = useSelector(
		(state: RootState) => state.group.groups.metadata
	);
	const deletedGroup = useSelector(
		(state: RootState) => state.group.deletedGroup
	);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	// TODO add option to determine limit number; default show 5 groups each time
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultGroupPerPage);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [createGroupOpen, setCreateGroupOpen] = useState<boolean>(false);
	const [errorOpen, setErrorOpen] = useState(false);
	const [deleteGroupConfirmOpen, setDeleteGroupConfirmOpen] = useState(false);
	const [selectedGroupId, setSelectedGroupId] = useState("");

	// component did mount
	useEffect(() => {
		listGroups((currPageNum - 1) * limit, limit);
	}, [adminMode, deletedGroup]);

	// search while typing
	useEffect(() => {
		// reset page with each new search term
		setCurrPageNum(1);
		if (searchTerm !== "") searchGroups(searchTerm, 0, limit);
		else listGroups(0, limit);
	}, [searchTerm]);

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		if (searchTerm !== "") searchGroups(searchTerm, newSkip, limit);
		else listGroups(newSkip, limit);
	};

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			<DeleteGroupModal
				deleteGroupConfirmOpen={deleteGroupConfirmOpen}
				setDeleteGroupConfirmOpen={setDeleteGroupConfirmOpen}
				groupId={selectedGroupId}
			/>
			<div className="outer-container">
				{/*create new group*/}
				<Dialog
					open={createGroupOpen}
					onClose={() => {
						setCreateGroupOpen(false);
					}}
					fullWidth={true}
					maxWidth="md"
					aria-labelledby="form-dialog"
				>
					<DialogTitle>Create New Group</DialogTitle>
					<DialogContent>
						<CreateGroup setCreateGroupOpen={setCreateGroupOpen} />
					</DialogContent>
				</Dialog>
				<Grid container>
					<Grid item xs={8} />
					<Grid item xs={4}>
						<Button
							variant="contained"
							onClick={() => {
								setCreateGroupOpen(true);
							}}
							endIcon={<GroupAddIcon />}
							sx={{ float: "right" }}
						>
							New Group
						</Button>
					</Grid>
				</Grid>
				<Grid container spacing={2}>
					<Grid item xs={12}>
						<GenericSearchBox
							title="Search for Groups"
							searchPrompt="keyword for group"
							setSearchTerm={setSearchTerm}
							searchTerm={searchTerm}
							searchFunction={searchGroups}
							skip={(currPageNum - 1) * limit}
							limit={limit}
						/>
					</Grid>
					<Grid item xs={12}>
						<TableContainer component={Paper}>
							<Table sx={{ minWidth: 650 }} aria-label="simple table">
								<TableHead>
									<TableRow>
										<TableCell
											sx={{
												fontWeight: 600,
											}}
										>
											Group Name
										</TableCell>
										<TableCell
											sx={{
												fontWeight: 600,
											}}
											align="left"
										>
											Description
										</TableCell>
										<TableCell
											sx={{
												fontWeight: 600,
											}}
											align="left"
										>
											<GroupsIcon />
										</TableCell>
										<TableCell align="left" />
									</TableRow>
								</TableHead>
								<TableBody>
									{groups.map((group) => {
										return (
											<TableRow
												key={group.id}
												sx={{
													"&:last-child td, &:last-child th": { border: 0 },
												}}
											>
												<TableCell scope="row" key={group.id}>
													<MuiLink
														component={Link}
														to={`/groups/${group.id}`}
														sx={{ textDecoration: "none" }}
													>
														{group.name}
													</MuiLink>
												</TableCell>
												<TableCell scope="row" key={group.id} align="left">
													{group.description}
												</TableCell>
												<TableCell scope="row" key={group.id} align="left">
													{group.users !== undefined ? group.users.length : 0}
												</TableCell>
												<TableCell
													scope="row"
													key={`${group.id}-delete`}
													align="left"
												>
													<IconButton
														aria-label="delete"
														size="small"
														onClick={() => {
															setSelectedGroupId(group.id);
															setDeleteGroupConfirmOpen(true);
														}}
													>
														<DeleteIcon fontSize="small" />
													</IconButton>
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
							<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
								<Pagination
									count={Math.ceil(pageMetadata.total_count / limit)}
									page={currPageNum}
									onChange={handlePageChange}
									shape="rounded"
									variant="outlined"
								/>
							</Box>
						</TableContainer>
					</Grid>
				</Grid>
			</div>
		</Layout>
	);
}
