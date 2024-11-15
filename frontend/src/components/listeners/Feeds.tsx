import React, { ChangeEvent, useEffect, useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	IconButton,
	Pagination,
	Paper,
	Snackbar,
} from "@mui/material";

import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import { fetchFeeds } from "../../actions/listeners";
import config from "../../app.config";
import { GenericSearchBox } from "../search/GenericSearchBox";
import Layout from "../Layout";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import { Link } from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";
import { ErrorModal } from "../errors/ErrorModal";
import DeleteFeedModal from "./DeleteFeedModal";
import { CreateFeedModal } from "./CreateFeedModal";

export function Feeds() {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listFeeds = (
		name: string | undefined,
		skip: number | undefined,
		limit: number | undefined
	) => dispatch(fetchFeeds(name, skip, limit));

	// snack bar
	const [snackBarOpen, setSnackBarOpen] = useState(false);
	const [snackBarMessage, setSnackBarMessage] = useState("");

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);
	const [createFeedModalOpen, setCreateFeedModalOpen] =
		useState<boolean>(false);
	const [deleteFeedConfirmOpen, setDeleteFeedConfirmOpen] =
		useState<boolean>(false);

	const [selectedFeedId, setSelectedFeedId] = useState();

	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultFeeds);

	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	const feeds = useSelector((state: RootState) => state.feed.feeds.data);
	const deletedFeed = useSelector((state: RootState) => state.feed.deletedFeed);
	const pageMetadata = useSelector(
		(state: RootState) => state.feed.feeds.metadata
	);
	const [searchTerm, setSearchTerm] = useState<string>("");
	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		listFeeds(searchTerm, newSkip, limit);
	};
	const handleFeedsSearch = () => {
		listFeeds(searchTerm, (currPageNum - 1) * limit, limit);
	};

	// component did mount

	useEffect(() => {
		listFeeds(searchTerm, (currPageNum - 1) * limit, limit);
	}, [createFeedModalOpen, deletedFeed, adminMode]);

	useEffect(() => {
		// reset page and reset category with each new search term
		setCurrPageNum(1);

		listFeeds(searchTerm, 0, limit);
	}, [searchTerm, adminMode]);

	// @ts-ignore
	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			{/*TODO PUT SNACKBAR HERE FROM OTHER COMPONENT*/}
			<Snackbar
				open={snackBarOpen}
				autoHideDuration={6000}
				onClose={() => {
					setSnackBarOpen(false);
					setSnackBarMessage("");
				}}
				message={snackBarMessage}
			/>
			{/*Create feed modal*/}
			<Dialog
				open={createFeedModalOpen}
				onClose={() => {
					setCreateFeedModalOpen(false);
				}}
				fullWidth={true}
				maxWidth="lg"
				aria-labelledby="form-dialog"
			>
				<DialogTitle>Create feed</DialogTitle>
				<DialogContent>
					<CreateFeedModal setCreateFeedOpen={setCreateFeedModalOpen} />
				</DialogContent>
			</Dialog>
			{/*Delete feed modal*/}
			<DeleteFeedModal
				deleteFeedConfirmOpen={deleteFeedConfirmOpen}
				setDeleteFeedConfirmOpen={setDeleteFeedConfirmOpen}
				feedId={selectedFeedId}
			/>
			<div className="outer-container">
				<Grid container>
					<Grid item xs={8} />
					<Grid item xs={4}>
						{adminMode ? (
							<Button
								variant="contained"
								onClick={() => {
									setCreateFeedModalOpen(true);
								}}
								sx={{ float: "right" }}
							>
								Create New Feed
							</Button>
						) : null}
					</Grid>
				</Grid>
				<Grid container spacing={2} paddingBottom={"16px"}>
					<Grid item xs={12}>
						{/*searchbox*/}
						<GenericSearchBox
							title="Search for Feeds"
							searchPrompt="Keyword for feeds"
							setSearchTerm={setSearchTerm}
							searchTerm={searchTerm}
							searchFunction={handleFeedsSearch}
							skip={(currPageNum - 1) * limit}
							limit={limit}
						/>
					</Grid>
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
										Feed Name
									</TableCell>
									<TableCell
										sx={{
											fontWeight: 600,
										}}
										align="left"
									>
										Description
									</TableCell>
									<TableCell align="left" />
								</TableRow>
							</TableHead>
							<TableBody>
								{feeds.map((feed) => {
									return (
										<TableRow
											key={feed.id}
											sx={{
												"&:last-child td, &:last-child th": { border: 0 },
											}}
										>
											<TableCell scope="row" key={`${feed.id}-name`}>
												<Button component={Link} to={`/feeds/${feed.id}`}>
													{feed.name}
												</Button>
											</TableCell>
											<TableCell
												scope="row"
												key={`${feed.id}-description`}
												align="left"
											>
												{feed.description}
											</TableCell>
											<TableCell
												scope="row"
												key={`${feed.id}-edit-delete`}
												align="left"
											>
												<IconButton
													aria-label="delete"
													size="small"
													onClick={() => {
														setSelectedFeedId(feed.id);
														setDeleteFeedConfirmOpen(true);
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
			</div>
		</Layout>
	);
}
