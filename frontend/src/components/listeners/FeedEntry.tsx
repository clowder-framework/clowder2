import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	Dialog,
	DialogContent,
	DialogTitle,
	Grid,
	Link,
} from "@mui/material";
import Layout from "../Layout";
import { useDispatch, useSelector } from "react-redux";
import Typography from "@mui/material/Typography";
import { useParams } from "react-router-dom";
import { MainBreadcrumbs } from "../navigation/BreadCrumb";
import { ErrorModal } from "../errors/ErrorModal";
import ReactJson from "react-json-view";
import {
	fetchFeed as fetchFeedAction,
	fetchListeners,
} from "../../actions/listeners";
import { RootState } from "../../types/data";
import DeleteIcon from "@mui/icons-material/Delete";
import { EditFeedModal } from "./EditFeedModal";
import DeleteFeedModal from "./DeleteFeedModal";
import EditIcon from "@mui/icons-material/Edit";
import { List } from "postcss/lib/list";
import { EventListenerOut } from "../../openapi/v2";

export function FeedEntry() {
	// path parameter
	const { feedId } = useParams<{
		feedId?: string;
	}>();

	// Redux connect equivalent
	const dispatch = useDispatch();
	const fetchFeed = (feedId: string | undefined) =>
		dispatch(fetchFeedAction(feedId));
	const feed = useSelector((state: RootState) => state.feed.feed);
	const listListeners = () => dispatch(fetchListeners());
	const listeners = useSelector(
		(state: RootState) => state.listener.listeners.data
	);

	const [deleteFeedConfirmOpen, setDeleteFeedConfirmOpen] =
		useState<boolean>(false);
	const [editFeedModalOpen, setEditFeedModalOpen] = useState<boolean>(false);

	// component did mount
	useEffect(() => {
		fetchFeed(feedId);
		listListeners();
	}, []);

	// Error msg dialog
	const [errorOpen, setErrorOpen] = useState(false);

	// for breadcrumb
	const paths = [
		{
			name: "Feeds",
			url: "/feeds",
		},
		{
			name: feed.name,
			url: `/feeds/${feed.id}`,
		},
	];

	// @ts-ignore
	return (
		<Layout>
			{/*Error Message dialogue*/}
			<ErrorModal errorOpen={errorOpen} setErrorOpen={setErrorOpen} />
			{/*breadcrumb*/}
			<Grid container>
				<Grid item xs={10} sx={{ display: "flex", alignItems: "center" }}>
					<MainBreadcrumbs paths={paths} />
				</Grid>
			</Grid>
			{/*Edit feed modal*/}
			<Dialog
				open={editFeedModalOpen}
				onClose={() => {
					setEditFeedModalOpen(false);
				}}
				fullWidth={true}
				maxWidth="lg"
				aria-labelledby="form-dialog"
			>
				<DialogTitle>Edit feed</DialogTitle>
				<DialogContent>
					<EditFeedModal setEditFeedOpen={setEditFeedModalOpen} feed={feed} />
				</DialogContent>
			</Dialog>
			{/*Delete feed modal*/}
			<DeleteFeedModal
				deleteFeedConfirmOpen={deleteFeedConfirmOpen}
				setDeleteFeedConfirmOpen={setDeleteFeedConfirmOpen}
				feedId={feedId}
			/>
			{/*Header & menus*/}
			<Grid container>
				<Grid
					item
					xs={12}
					sm={12}
					md={8}
					lg={9}
					sx={{
						display: "flex",
						justifyContent: "flex-start",
						alignItems: "baseline",
					}}
				>
					<Box sx={{ display: "flex", flexDirection: "column" }}>
						<Box
							sx={{
								display: "flex",
								flexDirection: "flex-start",
								alignItems: "baseline",
							}}
						>
							<Typography variant="h3" paragraph>
								{feed.name !== undefined ? feed.name : "Not found"}
							</Typography>
						</Box>
						<Typography variant="body1" paragraph>
							{feed.description !== undefined ? feed.description : ""}
						</Typography>
						<Typography variant="body1" paragraph>
							<strong>Creator: </strong>
							{feed.creator !== undefined && feed.creator !== null ? (
								<Link href={`mailto:${feed.creator}`}>{feed.creator}</Link>
							) : (
								<></>
							)}
						</Typography>
						<Typography variant="body1" paragraph>
							<strong>Match criteria: </strong>
							{feed.search !== undefined &&
							feed.search !== null &&
							feed.search.criteria !== undefined &&
							feed.search.criteria.length > 0 ? (
								feed.search.criteria.map((criterion, index) => (
									<span key={index}>
										{criterion.field} {criterion.operator} {criterion.value}
										{index !== feed.search.criteria.length - 1 && (
											<i> {feed.search.mode?.toLowerCase()} </i>
										)}
									</span>
								))
							) : (
								<></>
							)}
						</Typography>
						<Typography variant="body1" paragraph>
							<strong>Extractors: </strong>
							{listeners !== undefined &&
							listeners !== null &&
							feed.listeners !== undefined ? (
								listeners
									?.filter((listener) =>
										feed.listeners
											?.map((item) => item.listener_id)
											?.includes(listener.id)
									)
									.map((listener, index) => (
										<ul key={index}>
											<li>{listener.name}</li>
										</ul>
									))
							) : (
								<></>
							)}
						</Typography>
					</Box>
				</Grid>

				{/*Buttons*/}
				<Grid
					item
					xs={12}
					sm={12}
					md={4}
					lg={3}
					sx={{
						display: "flex",
						justifyContent: "flex-end",
						alignItems: "baseline",
						flexDirection: "row",
					}}
				>
					<Button
						variant="contained"
						aria-label="delete"
						onClick={() => {
							setEditFeedModalOpen(true);
						}}
						endIcon={<EditIcon />}
						sx={{ float: "left", marginRight: "0.5em" }}
					>
						Edit
					</Button>
					<Button
						variant="contained"
						aria-label="delete"
						onClick={() => {
							setDeleteFeedConfirmOpen(true);
						}}
						endIcon={<DeleteIcon />}
						sx={{ float: "right" }}
					>
						Delete
					</Button>
				</Grid>
			</Grid>
		</Layout>
	);
}
