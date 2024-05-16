import React, { ChangeEvent, useEffect, useState } from "react";
import {
	Box, Button,
	Checkbox,
	Divider,
	FormControl,
	FormControlLabel,
	Grid, IconButton,
	Input,
	InputLabel,
	List,
	MenuItem,
	Pagination,
	Paper,
	Select,
	Switch,
} from "@mui/material";

import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchFeeds
} from "../../actions/listeners";
import config from "../../app.config";
import { GenericSearchBox } from "../search/GenericSearchBox";
import Layout from "../Layout";
import TableContainer from "@mui/material/TableContainer";
import Table from "@mui/material/Table";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableCell from "@mui/material/TableCell";
import TableBody from "@mui/material/TableBody";
import {Link} from "react-router-dom";
import DeleteIcon from "@mui/icons-material/Delete";


export function Feeds() {
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listFeeds = (
		name: string| undefined,
		skip: number | undefined,
		limit: number | undefined
	) =>
		dispatch(
			fetchFeeds(
				name,
				skip,
				limit
			)
		);

	useEffect(() => {
		listFeeds("", 0, 20);
	}, []);

	const feeds = useSelector(
		(state: RootState) => state.feed.feeds.data
	);
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
		//setSearchTerm("")
	};
	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultFeeds);


	// component did mount



	useEffect(() => {
		listFeeds("", 0, limit);
	}, []);

	useEffect(() => {
		// reset page and reset category with each new search term
		setCurrPageNum(1);

		listFeeds(searchTerm, 0, limit);
	}, [searchTerm]);

	// @ts-ignore
	return (
		<Layout>
			<div className="outer-container">
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
													<Button
														component={Link}
														to={`/feeds/${feed.id}`}
													>
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
													key={`${feed.id}-delete`}
													align="left"
												>
													<IconButton
														aria-label="delete"
														size="small"
														onClick={() => {
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
