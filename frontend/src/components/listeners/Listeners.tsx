import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	ButtonGroup,
	Divider,
	FormControl,
	FormControlLabel,
	Grid,
	InputLabel,
	List,
	MenuItem,
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
import { ArrowBack, ArrowForward } from "@material-ui/icons";
import ListenerItem from "./ListenerItem";
import SubmitExtraction from "./SubmitExtraction";
import { capitalize } from "../../utils/common";
import config from "../../app.config";
import { GenericSearchBox } from "../search/GenericSearchBox";

type ListenerProps = {
	fileId?: string;
	datasetId?: string;
};

export function Listeners(props: ListenerProps) {
	const { fileId, datasetId } = props;
	// Redux connect equivalent
	const dispatch = useDispatch();
	const listListeners = (
		skip: number | undefined,
		limit: number | undefined,
		heartbeatInterval: number | undefined,
		selectedCategory: string | null,
		selectedLabel: string | null,
		aliveOnly: boolean | undefined
	) =>
		dispatch(
			fetchListeners(
				skip,
				limit,
				heartbeatInterval,
				selectedCategory,
				selectedLabel,
				aliveOnly
			)
		);
	const searchListeners = (
		text: string,
		skip: number | undefined,
		limit: number | undefined,
		heartbeatInterval: number | undefined
	) => dispatch(queryListeners(text, skip, limit, heartbeatInterval));
	const listAvailableCategories = () => dispatch(fetchListenerCategories());
	const listAvailableLabels = () => dispatch(fetchListenerLabels());

	const listeners = useSelector((state: RootState) => state.listener.listeners);
	const categories = useSelector(
		(state: RootState) => state.listener.categories
	);
	const labels = useSelector((state: RootState) => state.listener.labels);

	// TODO add option to determine limit number; default show 5 datasets each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>();
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
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
		listListeners(skip, limit, 0, null, null, aliveOnly);
		listAvailableCategories();
		listAvailableLabels();
	}, []);

	// fetch extractors from each individual dataset/id calls
	useEffect(() => {
		// disable flipping if reaches the last page
		if (listeners.length < limit) setNextDisabled(true);
		else setNextDisabled(false);
	}, [listeners]);

	// search
	useEffect(() => {
		if (searchText !== "") {
			handleListenerSearch();
		} else {
			listListeners(skip, limit, 0, selectedCategory, selectedLabel, aliveOnly);
		}
	}, [searchText]);

	useEffect(() => {
		setSearchText("");
		// flip to first page
		setSkip(0);
		listListeners(0, limit, 0, selectedCategory, selectedLabel, aliveOnly);
	}, [aliveOnly]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listListeners(skip, limit, 0, null, null, aliveOnly);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

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
					skip,
					limit,
					0,
					selectedCategory,
					selectedLabel,
					aliveOnly
				);
			}, config.extractorLivelihoodInterval);
			return () => clearInterval(interval);
		}
	}, [searchText, listeners, skip, selectedCategory, selectedLabel, aliveOnly]);

	// for pagination keep flipping until the return dataset is less than the limit
	const previous = () => {
		if (currPageNum - 1 >= 0) {
			setSkip((currPageNum - 1) * limit);
			setCurrPageNum(currPageNum - 1);
		}
	};
	const next = () => {
		if (listeners.length === limit) {
			setSkip((currPageNum + 1) * limit);
			setCurrPageNum(currPageNum + 1);
		}
	};

	const handleListenerSearch = () => {
		setSelectedCategory("");
		searchListeners(searchText, skip, limit, 0);
	};

	const handleCategoryChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedCategoryValue = (event.target as HTMLInputElement).value;
		setSelectedCategory(selectedCategoryValue);
		setSearchText("");
		listListeners(
			skip,
			limit,
			0,
			selectedCategoryValue,
			selectedLabel,
			aliveOnly
		);
	};

	const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedLabelValue = (event.target as HTMLInputElement).value;
		setSelectedLabel(selectedLabelValue);
		setSearchText("");
		listListeners(
			skip,
			limit,
			0,
			selectedCategory,
			selectedLabelValue,
			aliveOnly
		);
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
						skip={skip}
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
