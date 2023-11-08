import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	ButtonGroup,
	Divider,
	FormControl,
	FormControlLabel,
	FormLabel,
	Grid,
	IconButton,
	InputBase,
	List,
	Radio,
	RadioGroup,
} from "@mui/material";

import { RootState } from "../../types/data";
import { useDispatch, useSelector } from "react-redux";
import {
	fetchListenerCategories,
	fetchListenerLabels,
	fetchListeners,
	queryListeners,
} from "../../actions/listeners";
import { ArrowBack, ArrowForward, SearchOutlined } from "@material-ui/icons";
import ListenerItem from "./ListenerItem";
import { theme } from "../../theme";
import SubmitExtraction from "./SubmitExtraction";
import { capitalize } from "../../utils/common";

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
		selectedLabel: string | null
	) =>
		dispatch(
			fetchListeners(
				skip,
				limit,
				heartbeatInterval,
				selectedCategory,
				selectedLabel
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
	const [selectedExtractor, setSelectedExtractor] = useState();
	const [searchText, setSearchText] = useState<string>("");
	const [selectedCategory, setSelectedCategory] = useState("");
	const [selectedLabel, setSelectedLabel] = useState("");

	// component did mount
	useEffect(() => {
		listListeners(skip, limit, 0, null, null);
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
		if (searchText !== "") handleListenerSearch();
		else listListeners(skip, limit, 0, selectedCategory, selectedLabel);
	}, [searchText]);

	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listListeners(skip, limit, 0, null, null);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

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
		listListeners(skip, limit, 0, selectedCategoryValue, selectedLabel);
	};

	const handleLabelChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const selectedLabelValue = (event.target as HTMLInputElement).value;
		setSelectedLabel(selectedLabelValue);
		setSearchText("");
		listListeners(skip, limit, 0, selectedCategory, selectedLabelValue);
	};

	const handleSubmitExtractionClose = () => {
		// Cleanup the form
		setOpenSubmitExtraction(false);
	};

	return (
		<>
			<Grid container>
				<Grid item xs={3}>
					{/*searchbox*/}
					<Box
						component="form"
						sx={{
							p: "2px 4px",
							display: "flex",
							alignItems: "left",
							backgroundColor: theme.palette.primary.contrastText,
							width: "80%",
						}}
					>
						<InputBase
							sx={{ ml: 1, flex: 1 }}
							placeholder="Keyword for extractor"
							inputProps={{
								"aria-label": "Type in keyword to search for extractor",
							}}
							onChange={(e) => {
								setSearchText(e.target.value);
							}}
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									handleListenerSearch();
								}
							}}
							value={searchText}
						/>
						<IconButton
							type="button"
							sx={{ p: "10px" }}
							aria-label="search"
							onClick={handleListenerSearch}
						>
							<SearchOutlined />
						</IconButton>
					</Box>
					<Box sx={{ margin: "2em auto", padding: "0.5em" }}>
						{/*categories*/}
						<FormControl>
							<FormLabel id="radio-buttons-group-label-categories">
								Filter by category
							</FormLabel>
							<RadioGroup
								aria-labelledby="radio-buttons-group-label-categories"
								defaultValue="all"
								name="radio-buttons-group"
								value={selectedCategory}
								onChange={handleCategoryChange}
							>
								<FormControlLabel value="" control={<Radio />} label="All" />
								{categories.map((category: string) => {
									return (
										<FormControlLabel
											value={category}
											control={<Radio />}
											label={capitalize(category)}
										/>
									);
								})}
							</RadioGroup>
						</FormControl>
					</Box>
					<Box sx={{ margin: "2em auto", padding: "0.5em" }}>
						{/*labels*/}
						<FormControl>
							<FormLabel id="radio-buttons-group-label-labels">
								Filter by labels
							</FormLabel>
							<RadioGroup
								aria-labelledby="radio-buttons-group-label-labels"
								defaultValue="all"
								name="radio-buttons-group"
								value={selectedLabel}
								onChange={handleLabelChange}
							>
								<FormControlLabel value="" control={<Radio />} label="All" />
								{labels.map((label: string) => {
									return (
										<FormControlLabel
											value={label}
											control={<Radio />}
											label={capitalize(label)}
										/>
									);
								})}
							</RadioGroup>
						</FormControl>
					</Box>
				</Grid>
				<Grid item xs={9}>
					<Box
						sx={{
							backgroundColor: theme.palette.primary.contrastText,
							padding: "3em",
						}}
					>
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
												extractorInfo={listener}
												extractorName={listener.name}
												extractorDescription={listener.description}
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
					</Box>
				</Grid>
			</Grid>
			<SubmitExtraction
				fileId={fileId}
				datasetId={datasetId}
				open={openSubmitExtraction}
				handleClose={handleSubmitExtractionClose}
				selectedExtractor={selectedExtractor}
			/>
		</>
	);
}
