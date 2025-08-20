import React, { ChangeEvent, useEffect, useState } from "react";
import {
	Box,
	Divider,
	FormControl,
	FormControlLabel,
	Grid,
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
	fetchListenerCategories,
	fetchListenerLabels,
	fetchListeners,
	queryListeners,
} from "../../actions/listeners";
import ListenerItem from "./ListenerItem";
import SubmitExtraction from "./SubmitExtraction";
import { capitalize } from "../../utils/common";
import config from "../../app.config";
import { GenericSearchBox } from "../search/GenericSearchBox";

type ListenerProps = {
	fileId?: string;
	datasetId?: string;
	process?: string;
};

export function Listeners(props: ListenerProps) {
	const { fileId, datasetId, process } = props;
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listListeners = (
		skip: number | undefined,
		limit: number | undefined,
		heartbeatInterval: number | undefined,
		selectedCategory: string | null,
		selectedLabel: string | null,
		aliveOnly: boolean | undefined,
		process: string | undefined
	) =>
		dispatch(
			fetchListeners(
				skip,
				limit,
				heartbeatInterval,
				selectedCategory,
				selectedLabel,
				aliveOnly,
				process,
				datasetId
			)
		);
	const searchListeners = (
		text: string,
		skip: number | undefined,
		limit: number | undefined,
		heartbeatInterval: number | undefined,
		process: string | undefined
	) =>
		dispatch(
			queryListeners(text, skip, limit, heartbeatInterval, process, datasetId)
		);
	const listAvailableCategories = () => dispatch(fetchListenerCategories());
	const listAvailableLabels = () => dispatch(fetchListenerLabels());

	const listeners = useSelector(
		(state: RootState) => state.listener.listeners.data
	);
	const pageMetadata = useSelector(
		(state: RootState) => state.listener.listeners.metadata
	);
	const categories = useSelector(
		(state: RootState) => state.listener.categories
	);
	const labels = useSelector((state: RootState) => state.listener.labels);
	const adminMode = useSelector((state: RootState) => state.user.adminMode);

	const [currPageNum, setCurrPageNum] = useState<number>(1);
	const [limit] = useState<number>(config.defaultExtractors);
	const [openSubmitExtraction, setOpenSubmitExtraction] =
		useState<boolean>(false);
	const [infoOnly, setInfoOnly] = useState<boolean>(false);
	const [selectedExtractor, setSelectedExtractor] = useState();
	const [searchText, setSearchText] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedLabel, setSelectedLabel] = useState("");
	const [aliveOnly, setAliveOnly] = useState<boolean>(false);

	// component did mount
	useEffect(() => {
		listListeners(0, limit, 0, null, null, aliveOnly, process);
		listAvailableCategories();
		listAvailableLabels();
	}, [adminMode]);

	// search
	useEffect(() => {
		// reset page and reset category with each new search term
		setCurrPageNum(1);
		setSelectedCategory("");

		if (searchText !== "") searchListeners(searchText, 0, limit, 0, process);
		else
			listListeners(
				0,
				limit,
				0,
				selectedCategory,
				selectedLabel,
				aliveOnly,
				process
			);
	}, [searchText, adminMode]);

	useEffect(() => {
		// reset page and reset search text with each new search term
		setCurrPageNum(1);
		setSearchText("");
		listListeners(
			0,
			limit,
			0,
			selectedCategory,
			selectedLabel,
			aliveOnly,
			process
		);
	}, [aliveOnly, adminMode]);

	// any of the change triggers timer to fetch the extractor status
	useEffect(() => {
		if (searchText !== "") {
			const interval = setInterval(() => {
				handleListenerSearch();
			}, config.extractorLivelihoodInterval);
			return () => clearInterval(interval);
		} else {
			// set the interval to fetch the job's log
			const interval = setInterval(() => {
				listListeners(
					(currPageNum - 1) * limit,
					limit,
					0,
					selectedCategory,
					selectedLabel,
					aliveOnly,
					process
				);
			}, config.extractorLivelihoodInterval);
			return () => clearInterval(interval);
		}
	}, [
		searchText,
		listeners,
		currPageNum,
		selectedCategory,
		selectedLabel,
		aliveOnly,
		adminMode,
	]);

	const handleListenerSearch = () => {
		setSelectedCategory("");
		searchListeners(searchText, (currPageNum - 1) * limit, limit, 0, process);
	};

	const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedCategoryValue = (event.target as HTMLInputElement).value;
		setSelectedCategory(selectedCategoryValue);
		setSearchText("");
		listListeners(
			0,
			limit,
			0,
			selectedCategoryValue,
			selectedLabel,
			aliveOnly,
			process
		);
	};

	const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedLabelValue = (event.target as HTMLInputElement).value;
		setSelectedLabel(selectedLabelValue);
		setSearchText("");
		listListeners(
			0,
			limit,
			0,
			selectedCategory,
			selectedLabelValue,
			aliveOnly,
			process
		);
	};

	const handlePageChange = (_: ChangeEvent<unknown>, value: number) => {
		const newSkip = (value - 1) * limit;
		setCurrPageNum(value);
		if (searchText !== "")
			searchListeners(searchText, newSkip, limit, 0, process);
		else listListeners(newSkip, limit, 0, null, null, aliveOnly, process);
	};

	const handleSubmitExtractionClose = () => {
		// Cleanup the form
		setOpenSubmitExtraction(false);
	};

	return (
		<>
			<Grid container>
				<Grid item xs={12}>
					{/*searchbox*/}
					<GenericSearchBox
						title="Search for Extractors"
						searchPrompt="Keyword for extractor"
						setSearchTerm={setSearchText}
						searchTerm={searchText}
						searchFunction={handleListenerSearch}
						skip={(currPageNum - 1) * limit}
						limit={limit}
					/>
				</Grid>
			</Grid>
			<Grid
				container
				sx={{ padding: "0 0 1em 0", justifyContent: "space-between" }}
				spacing={3}
			>
				{/*categories*/}
				<Grid item xs={5}>
					<FormControl variant="standard" sx={{ width: "100%" }}>
						<InputLabel id="label-categories">Filter by category</InputLabel>
						<Select
							defaultValue=""
							labelId="label-categories"
							id="label-categories"
							value={selectedCategory}
							onChange={handleCategoryChange}
							label="Categories"
						>
							<MenuItem value="">All</MenuItem>
							{categories.map((category: string) => {
								return (
									<MenuItem value={category}>{capitalize(category)}</MenuItem>
								);
							})}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={5}>
					<FormControl variant="standard" sx={{ width: "100%" }}>
						<InputLabel id="label-categories">Filter by labels</InputLabel>
						<Select
							defaultValue=""
							labelId="label-labels"
							id="label-labels"
							value={selectedLabel}
							onChange={handleLabelChange}
							label="Labels"
						>
							<MenuItem value="">All</MenuItem>
							{labels.map((label: string) => {
								return <MenuItem value={label}>{capitalize(label)}</MenuItem>;
							})}
						</Select>
					</FormControl>
				</Grid>
				<Grid item xs={2}>
					<FormControlLabel
						sx={{ margin: "auto auto -2.5em auto" }}
						control={
							<Switch
								color="primary"
								checked={aliveOnly}
								onChange={() => {
									setAliveOnly(!aliveOnly);
								}}
							/>
						}
						label="Alive Extractors"
					/>
				</Grid>
			</Grid>
			<Grid container>
				<Grid item xs={12}>
					<Paper sx={{ width: "100%", mb: 2, padding: "3em" }}>
						<List>
							{listeners !== undefined ? (
								listeners.map((listener) => {
									return (
										<>
											<ListenerItem
												key={listener.id}
												id={listener.id}
												fileId={fileId}
												datasetId={datasetId}
												extractor={listener}
												extractorName={listener.name}
												extractorDescription={listener.description}
												setInfoOnly={setInfoOnly}
												setOpenSubmitExtraction={setOpenSubmitExtraction}
												setSelectedExtractor={setSelectedExtractor}
												showSubmit={true}
											/>
											<Divider />
										</>
									);
								})
							) : (
								<></>
							)}
						</List>
						<Box display="flex" justifyContent="center" sx={{ m: 1 }}>
							<Pagination
								count={Math.ceil(pageMetadata.total_count / limit)}
								page={currPageNum}
								onChange={handlePageChange}
								shape="rounded"
								variant="outlined"
							/>
						</Box>
					</Paper>
				</Grid>
			</Grid>
			<SubmitExtraction
				fileId={fileId}
				datasetId={datasetId}
				open={openSubmitExtraction}
				infoOnly={infoOnly}
				handleClose={handleSubmitExtractionClose}
				selectedExtractor={selectedExtractor}
			/>
		</>
	);
}
