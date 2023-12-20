import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	ButtonGroup,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
} from "@mui/material";
import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchGroups,
	searchGroups as searchGroupsAction,
} from "../../actions/group";
import { ArrowBack, ArrowForward } from "@material-ui/icons";
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

	const groups = useSelector((state: RootState) => state.group.groups);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	// TODO add option to determine limit number; default show 5 groups each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit] = useState<number>(5);
	const [skip, setSkip] = useState<number | undefined>(0);
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const [createGroupOpen, setCreateGroupOpen] = useState<boolean>(false);

	// component did mount
	useEffect(() => {
		listGroups(skip, limit);
	}, []);

	useEffect(() => {
		listGroups(skip, limit);
	}, [adminMode]);

	useEffect(() => {
		// disable flipping if reaches the last page
		if (groups.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [groups]);

	// search
	useEffect(() => {
		if (searchTerm !== "") searchGroups(searchTerm, skip, limit);
		else listGroups(skip, limit);
	}, [searchTerm]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listGroups(skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (groups.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};

	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
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
					<Grid item xs={8}></Grid>
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
							skip={skip}
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
													<Button component={Link} to={`/groups/${group.id}`}>
														{group.name}
													</Button>
												</TableCell>
												<TableCell scope="row" key={group.id} align="left">
													{group.description}
												</TableCell>
												<TableCell scope="row" key={group.id} align="left">
													{group.users !== undefined ? group.users.length : 0}
												</TableCell>
											</TableRow>
										);
									})}
								</TableBody>
							</Table>
							<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
								<ButtonGroup
									variant="contained"
									aria-label="previous next buttons"
								>
									<Button
										aria-label="previous"
										onClick={previous}
										disabled={prevDisabled}
									>
										<ArrowBack /> Prev
									</Button>
									<Button
										aria-label="next"
										onClick={next}
										disabled={nextDisabled}
									>
										Next <ArrowForward />
									</Button>
								</ButtonGroup>
							</Box>
						</TableContainer>
					</Grid>
				</Grid>
			</div>
		</Layout>
	);
}
