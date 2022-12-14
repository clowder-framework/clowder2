import React, {useEffect, useState} from "react";
import {Box, Button, ButtonGroup, Divider, Grid, IconButton, List, Paper, TextField, InputBase} from "@mui/material";

import {RootState} from "../../types/data";
import {useDispatch, useSelector} from "react-redux";
import {fetchListeners, queryListeners} from "../../actions/listeners";
import {ArrowBack, ArrowForward, SearchOutlined} from "@material-ui/icons";
import ListenerItem from "./ListenerItem";
import {theme} from "../../theme";


export const Listeners = (): JSX.Element => {

	// Redux connect equivalent
	const dispatch = useDispatch();
	const listListeners = (skip: number | undefined, limit: number | undefined) => dispatch(fetchListeners(skip, limit));
	const searchListeners = (text: string, skip: number | undefined, limit: number | undefined) =>
		dispatch(queryListeners(text, skip, limit));

	const listeners = useSelector((state: RootState) => state.listener.listeners);

	// TODO add option to determine limit number; default show 5 datasets each time
	const [currPageNum, setCurrPageNum] = useState<number>(0);
	const [limit,] = useState<number>(20);
	const [skip, setSkip] = useState<number | undefined>();
	const [prevDisabled, setPrevDisabled] = useState<boolean>(true);
	const [nextDisabled, setNextDisabled] = useState<boolean>(false);
	const [searchText, setSearchText] = useState<string>("");

	// component did mount
	useEffect(() => {
		listListeners(skip, limit);
	}, []);

	// fetch thumbnails from each individual dataset/id calls
	useEffect(() => {

		// disable flipping if reaches the last page
		if (listeners.length < limit) setNextDisabled(true);
		else setNextDisabled(false);

	}, [listeners]);

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
	useEffect(() => {
		if (skip !== null && skip !== undefined) {
			listListeners(skip, limit);
			if (skip === 0) setPrevDisabled(true);
			else setPrevDisabled(false);
		}
	}, [skip]);

	const handleListenerSearch = () => {
		searchListeners(searchText, skip, limit);
	}

	return (
		<Grid container>
			<Grid item xs={4}>
				<Box
					component="form"
					sx={{p: "2px 4px",
						display: "flex",
						alignItems: "left",
						backgroundColor:theme.palette.primary.contrastText,
						width:"80%"
					}}
				>
					<InputBase
						sx={{ml: 1, flex: 1}}
						placeholder="keyword for extractor"
						inputProps={{"aria-label": "Type in keyword to search for extractor"}}
						onChange={(e) => {
							setSearchText(e.target.value);
						   }}
						onKeyDown = {(e) => {
							if (e.key === "Enter") {
								e.preventDefault();
								handleListenerSearch();
							}
						}}
					   value={searchText}
					/>
					<IconButton type="button" sx={{p: "10px"}} aria-label="search"
								onClick={handleListenerSearch}>
						<SearchOutlined/>
					</IconButton>
				</Box>
			</Grid>
			<Grid item xs={8}>
				<Box sx={{
					backgroundColor:theme.palette.primary.contrastText
				}}>
					<List>
						{
							listeners !== undefined ?
								listeners.map((listener) => {
									return (<>
										<ListenerItem key={listener.id}
													  id={listener.id}
													  extractorName={listener.name}
													  extractorDescription={listener.description}
										/>
										<Divider/>
									</>);
								})
								:
								<></>
						}
					</List>
					<Box display="flex" justifyContent="center" sx={{m: 1}}>
						<ButtonGroup variant="contained" aria-label="previous next buttons">
							<Button aria-label="previous" onClick={previous} disabled={prevDisabled}>
								<ArrowBack/> Prev
							</Button>
							<Button aria-label="next" onClick={next} disabled={nextDisabled}>
								Next <ArrowForward/>
							</Button>
						</ButtonGroup>
					</Box>
				</Box>
			</Grid>
		</Grid>
	);
}
